import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { t } from '../../lib/l10n';
import { Copy, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiTokenDialog: React.FC<ApiTokenDialogProps> = ({ open, onOpenChange }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchToken = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      const oc = (globalThis as any).OC;
      if (oc && oc.requestToken) {
        headers['requesttoken'] = oc.requestToken;
      }
      const res = await fetch('/apps/bookmarksmanager/api/v1/token', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.token) {
          setToken(data.token);
        } else {
          setToken(null);
        }
      } else if (res.status === 404) {
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchToken();
    }
  }, [open]);

  const generateToken = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      const oc = (globalThis as any).OC;
      if (oc && oc.requestToken) {
        headers['requesttoken'] = oc.requestToken;
      }
      const res = await fetch('/apps/bookmarksmanager/api/v1/token/generate', {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
      }
    } catch (error) {
      console.error('Failed to generate token:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeToken = async () => {
    if (!confirm(t('settings.api_token.revoke_confirm'))) {
      return;
    }
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      const oc = (globalThis as any).OC;
      if (oc && oc.requestToken) {
        headers['requesttoken'] = oc.requestToken;
      }
      const res = await fetch('/apps/bookmarksmanager/api/v1/token/revoke', {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to revoke token:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('settings.api_token.title')}</DialogTitle>
          <DialogDescription>{t('settings.api_token.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {token ? (
            <>
              <div className="space-y-2">
                <Label>{t('settings.api_token.your_token')}</Label>
                <div className="flex gap-2">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={copied}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600">{t('settings.api_token.copied')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={revokeToken}
                  disabled={loading}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('settings.api_token.revoke')}
                </Button>
                <Button
                  variant="outline"
                  onClick={generateToken}
                  disabled={loading}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('settings.api_token.regenerate')}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('settings.api_token.no_token')}
              </p>
              <Button
                onClick={generateToken}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('settings.api_token.generate')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiTokenDialog;

