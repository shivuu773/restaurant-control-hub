import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MFAVerification = ({ onSuccess, onCancel }: MFAVerificationProps) => {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      // Get the factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) throw factorsError;
      
      const totpFactors = factorsData.totp || [];
      const verifiedFactor = totpFactors.find(f => f.status === 'verified');
      
      if (!verifiedFactor) {
        throw new Error('No verified MFA factor found');
      }
      
      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      
      if (challengeError) throw challengeError;
      
      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code,
      });
      
      if (verifyError) throw verifyError;
      
      toast.success('Verification successful!');
      onSuccess();
    } catch (error: any) {
      setError('Invalid verification code. Please try again.');
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-xl mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
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
        
        {error && (
          <p className="text-sm text-center text-destructive">{error}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={handleVerify}
          className="w-full"
          disabled={code.length !== 6 || verifying}
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
        
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
          disabled={verifying}
        >
          Cancel
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        Lost access to your authenticator? Contact support for help.
      </p>
    </motion.div>
  );
};

export default MFAVerification;
