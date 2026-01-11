import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  MapPin, 
  LogOut,
  RefreshCw,
  AlertTriangle,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: string | null;
  ip_address: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  last_active_at: string;
  created_at: string;
  is_current: boolean;
  is_revoked: boolean;
  revoked_at: string | null;
}

const SessionManagement = () => {
  const { user, session } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    if (user && session) {
      loadSessions();
      recordCurrentSession();
    }
  }, [user, session]);

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let deviceType = 'desktop';

    // Detect browser
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) { os = 'Android'; deviceType = 'mobile'; }
    else if (ua.includes('iPhone') || ua.includes('iPad')) { 
      os = ua.includes('iPad') ? 'iPadOS' : 'iOS'; 
      deviceType = ua.includes('iPad') ? 'tablet' : 'mobile';
    }

    return { browser, os, deviceType, userAgent: ua };
  };

  const recordCurrentSession = async () => {
    if (!user || !session) return;

    const { browser, os, userAgent } = getDeviceInfo();
    const sessionToken = session.access_token.slice(-20); // Use last 20 chars as identifier

    // Check if this session already exists
    const { data: existing } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_token', sessionToken)
      .eq('is_revoked', false)
      .maybeSingle();

    if (existing) {
      // Update last active
      await supabase
        .from('user_sessions')
        .update({ 
          last_active_at: new Date().toISOString(),
          is_current: true 
        })
        .eq('id', existing.id);

      // Mark other sessions as not current
      await supabase
        .from('user_sessions')
        .update({ is_current: false })
        .eq('user_id', user.id)
        .neq('id', existing.id);
    } else {
      // Mark all existing sessions as not current
      await supabase
        .from('user_sessions')
        .update({ is_current: false })
        .eq('user_id', user.id);

      // Create new session record
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          device_info: userAgent,
          browser,
          os,
          is_current: true,
        });
    }
  };

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_revoked', false)
        .order('last_active_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_revoked: true, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error: any) {
      toast.error('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!user || !session) return;

    setRevokingAll(true);
    const currentToken = session.access_token.slice(-20);

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_revoked: true, 
          revoked_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .neq('session_token', currentToken)
        .eq('is_revoked', false);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.is_current));
      toast.success('All other sessions revoked');
    } catch (error: any) {
      toast.error('Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (os: string | null, deviceInfo: string | null) => {
    const info = (os || deviceInfo || '').toLowerCase();
    if (info.includes('iphone') || info.includes('android') || info.includes('ios')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (info.includes('ipad') || info.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const otherSessions = sessions.filter(s => !s.is_current);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your active login sessions across devices
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No active sessions found
          </p>
        ) : (
          <>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  sess.is_current 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`p-2 rounded-full ${
                    sess.is_current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getDeviceIcon(sess.os, sess.device_info)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {sess.browser || 'Unknown Browser'}
                      </span>
                      {sess.is_current && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {sess.os || 'Unknown OS'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active: {formatDate(sess.last_active_at)}
                      </div>
                      {sess.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {sess.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {!sess.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={revoking === sess.id}
                      >
                        {revoking === sess.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will log out this device. If it wasn't you, consider changing your password.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => revokeSession(sess.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}

            {otherSessions.length > 0 && (
              <div className="pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={revokingAll}
                    >
                      {revokingAll ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Revoke All Other Sessions ({otherSessions.length})
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will log out all devices except this one. You'll need to sign in again on those devices.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={revokeAllOtherSessions}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Revoke All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionManagement;