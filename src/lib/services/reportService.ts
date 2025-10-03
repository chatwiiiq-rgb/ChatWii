import { supabase } from '$lib/supabase';

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: 'underage' | 'abusive' | 'scam' | 'spam' | 'explicit' | 'other';
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface SubmitReportParams {
  reporterId: string;
  reportedId: string;
  reason: 'underage' | 'abusive' | 'scam' | 'spam' | 'explicit' | 'other';
  details?: string | null;
}

/**
 * Report Service
 * Handles user reporting functionality
 * Reports are stored for 48 hours for admin review
 */
export class ReportService {
  /**
   * Submit a report
   */
  async submitReport(params: SubmitReportParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { reporterId, reportedId, reason, details } = params;

      // Prevent self-reporting
      if (reporterId === reportedId) {
        return { success: false, error: 'Cannot report yourself' };
      }

      // Check if user has already reported this person
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', reporterId)
        .eq('reported_id', reportedId)
        .maybeSingle();

      if (existingReport) {
        return { success: false, error: 'You have already reported this user' };
      }

      // Validate details for 'other' reason
      if (reason === 'other') {
        if (!details || details.trim().length === 0) {
          return { success: false, error: 'Details are required for "Other" reason' };
        }
        if (details.length > 100) {
          return { success: false, error: 'Details must be 100 characters or less' };
        }
      }

      // Insert report
      const { error } = await supabase.from('reports').insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        reason,
        details: reason === 'other' ? details : null,
        status: 'pending',
      });

      if (error) {
        console.error('Submit report error:', error);
        return { success: false, error: 'Failed to submit report' };
      }

      return { success: true };
    } catch (error) {
      console.error('Submit report error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get reports submitted by a user
   */
  async getUserReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get user reports error:', error);
        return [];
      }

      return (data as Report[]) || [];
    } catch (error) {
      console.error('Get user reports error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
