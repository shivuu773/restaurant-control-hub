import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldCheck, ShieldOff, Smartphone, Copy, Check, AlertTriangle, Loader2, Key, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
  created_at: string;
}

// Generate a random backup code
const generateBackupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.slice(0, 4) + '-' + code.slice(4);
};

// Simple hash function for backup codes (using Web Crypto API)
const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.replace('-', '').toUpperCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const AdminTwoFactorAuth = () => {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Enrollment state
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  
  // Disable state
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);
  
  // Backup codes state
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState(0);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

  useEffect(() => {
    loadMFAFactors();
  }, []);

  useEffect(() => {
    if (isEnabled) {
      loadBackupCodesCount();
    }
  }, [isEnabled]);

  const loadMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      const totpFactors = data.totp || [];
      setFactors(totpFactors);
      setIsEnabled(totpFactors.some(f => f.status === 'verified'));
    } catch (error: any) {
      console.error('Error loading MFA factors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBackupCodesCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('mfa_backup_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_used', false);

      setRemainingCodes(count || 0);
    } catch (error) {
      console.error('Error loading backup codes count:', error);
    }
  };

  const generateBackupCodes = async () => {
    setGeneratingCodes(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing backup codes
      await supabase
        .from('mfa_backup_codes')
        .delete()
        .eq('user_id', user.id);

      // Generate 10 new backup codes
      const newCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        newCodes.push(generateBackupCode());
      }

      // Hash and store codes
      const codesToInsert = await Promise.all(
        newCodes.map(async (code) => ({
          user_id: user.id,
          code_hash: await hashCode(code),
        }))
      );

      const { error } = await supabase
        .from('mfa_backup_codes')
        .insert(codesToInsert);

      if (error) throw error;

      setBackupCodes(newCodes);
      setShowBackupCodes(true);
      setRemainingCodes(10);
      toast.success('Backup codes generated successfully!');
    } catch (error: any) {
      toast.error('Failed to generate backup codes: ' + error.message);
    } finally {
      setGeneratingCodes(false);
      setConfirmRegenerateOpen(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
    toast.success('Backup codes copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const codesText = `Zayka Admin - 2FA Backup Recovery Codes\n${'='.repeat(40)}\n\nGenerated: ${new Date().toLocaleString()}\n\nIMPORTANT: Store these codes in a safe place!\nEach code can only be used once.\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\n${'='.repeat(40)}\nIf you lose access to your authenticator app,\nuse one of these codes to regain access.`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zayka-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const startEnrollment = async () => {
    setEnrolling(true);
    setEnrollDialogOpen(true);
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (error: any) {
      toast.error('Failed to start 2FA setup: ' + error.message);
      setEnrollDialogOpen(false);
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId || verifyCode.length !== 6) return;
    
    setVerifying(true);
    
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      
      if (verifyError) throw verifyError;
      
      toast.success('Two-Factor Authentication enabled successfully!');
      setEnrollDialogOpen(false);
      resetEnrollmentState();
      loadMFAFactors();
      
      // Auto-generate backup codes after enabling 2FA
      setTimeout(() => {
        setBackupCodesDialogOpen(true);
        generateBackupCodes();
      }, 500);
    } catch (error: any) {
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    const verifiedFactor = factors.find(f => f.status === 'verified');
    if (!verifiedFactor || disableCode.length !== 6) return;
    
    setDisabling(true);
    
    try {
      // First, we need to verify the current session with MFA
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code: disableCode,
      });
      
      if (verifyError) throw verifyError;
      
      // Now unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });
      
      if (unenrollError) throw unenrollError;

      // Delete backup codes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('mfa_backup_codes')
          .delete()
          .eq('user_id', user.id);
      }
      
      toast.success('Two-Factor Authentication disabled');
      setDisableDialogOpen(false);
      setDisableCode('');
      setRemainingCodes(0);
      loadMFAFactors();
    } catch (error: any) {
      toast.error('Failed to disable 2FA: ' + error.message);
    } finally {
      setDisabling(false);
    }
  };

  const resetEnrollmentState = () => {
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerifyCode('');
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      startEnrollment();
    } else {
      setDisableDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                {isEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
          
          {isEnabled && (
            <>
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      Your account is protected
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll be asked for a verification code from your authenticator app when signing in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup Codes Section */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Backup Recovery Codes</p>
                    <p className="text-sm text-muted-foreground">
                      {remainingCodes > 0 
                        ? `${remainingCodes} unused codes remaining`
                        : 'No backup codes generated'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (remainingCodes > 0) {
                      setConfirmRegenerateOpen(true);
                    } else {
                      setBackupCodesDialogOpen(true);
                      generateBackupCodes();
                    }
                  }}
                  disabled={generatingCodes}
                >
                  {generatingCodes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : remainingCodes > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {remainingCodes > 0 && remainingCodes <= 3 && (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400">
                        Low backup codes
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You only have {remainingCodes} backup code{remainingCodes !== 1 ? 's' : ''} left. Consider regenerating new codes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {!isEnabled && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Recommended for admin accounts
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable two-factor authentication to protect your admin account from unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetEnrollmentState();
        }
        setEnrollDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Set up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          {enrolling ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : qrCode ? (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              
              {/* Manual Entry Secret */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Can't scan? Enter this code manually:
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-muted text-xs font-mono break-all">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                    className="shrink-0"
                  >
                    {secretCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Verification Code Input */}
              <div className="space-y-2">
                <Label>Enter the 6-digit code from your app:</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verifyCode}
                    onChange={setVerifyCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnrollDialogOpen(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyEnrollment}
              disabled={verifyCode.length !== 6 || verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Backup Recovery Codes
            </DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          {generatingCodes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showBackupCodes && backupCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    These codes will only be shown once. Make sure to save them!
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono text-center py-1">
                    {code}
                  </code>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyBackupCodes}
                >
                  {backupCodesCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={downloadBackupCodes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button onClick={() => {
              setBackupCodesDialogOpen(false);
              setShowBackupCodes(false);
              setBackupCodes([]);
            }}>
              I've saved my codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Regenerate Dialog */}
      <AlertDialog open={confirmRegenerateOpen} onOpenChange={setConfirmRegenerateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              Regenerate Backup Codes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate all your existing backup codes. Make sure you have access to your authenticator app before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => {
                setBackupCodesDialogOpen(true);
                generateBackupCodes();
              }}
              disabled={generatingCodes}
            >
              {generatingCodes ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Regenerate Codes'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" />
              Disable Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make your account less secure. You'll need to enter your current 2FA code to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label>Enter your current 2FA code:</Label>
            <div className="flex justify-center mt-2">
              <InputOTP
                maxLength={6}
                value={disableCode}
                onChange={setDisableCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisableCode('')}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={disableCode.length !== 6 || disabling}
            >
              {disabling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminTwoFactorAuth;
