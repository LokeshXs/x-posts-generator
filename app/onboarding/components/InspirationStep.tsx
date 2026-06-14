'use client';

import { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { IconX } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const USERNAME_REGEX = /^[A-Za-z0-9_]{1,15}$/;

export function InspirationStep() {
  const { formData, updateFormData } = useFormContext();
  const accounts: string[] = formData.inspirationAccounts || [];
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const addAccount = () => {
    // Allow several usernames at once, separated by spaces. Trim each token and
    // strip a leading @ the user may have typed before the username.
    const tokens = draft
      .split(/\s+/)
      .map((t) => t.trim().replace(/^@+/, ''))
      .filter(Boolean);

    if (tokens.length === 0) {
      setError('Please enter a username.');
      return;
    }

    const seen = new Set(accounts.map((a) => a.toLowerCase()));
    const toAdd: string[] = [];
    const invalid: string[] = [];

    for (const token of tokens) {
      if (!USERNAME_REGEX.test(token)) {
        invalid.push(token);
        continue;
      }
      const key = token.toLowerCase();
      if (seen.has(key)) continue; // skip duplicates (already added or repeated in this batch)
      seen.add(key);
      toAdd.push(token);
    }

    if (toAdd.length > 0) {
      updateFormData({ inspirationAccounts: [...accounts, ...toAdd] });
    }

    if (invalid.length > 0) {
      // Keep the rejected tokens in the field so they can be corrected.
      setDraft(invalid.join(' '));
      setError(
        `Couldn't add ${invalid
          .map((t) => `"${t}"`)
          .join(', ')} — use 1–15 letters, numbers, or underscores.`,
      );
      return;
    }

    setDraft('');
    setError(
      toAdd.length === 0 ? 'You already added that account.' : '',
    );
  };

  const removeAccount = (name: string) => {
    updateFormData({
      inspirationAccounts: accounts.filter((a) => a !== name),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAccount();
    }
  };

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl text-center sm:text-left">
          Who <em>inspires</em> you?{' '}
          <span className="text-base max-sm:text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </h2>
        <p className="text-muted-foreground">
          Add X accounts whose posts you love — we&apos;ll draw inspiration from
          them.
        </p>
      </div>

      {/* Username Input */}
      <div className="flex flex-col gap-2 max-w-xl">
        <div className="flex gap-2 max-sm:flex-col">
          <Input
            type="text"
            aria-label="X username"
            placeholder="@username…"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className=' max-sm:text-sm'
          />
          <Button
            type="button"
            variant="outline"
            onClick={addAccount}
            disabled={!draft.trim()}
          >
            Add
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Add several at once, separated by spaces.
          </p>
        )}
      </div>

      {/* Added Accounts */}
      {accounts.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-xl">
          {accounts.map((name) => (
            <Badge key={name} variant="secondary" className="gap-1 pr-1">
              @{name}
              <button
                type="button"
                onClick={() => removeAccount(name)}
                aria-label={`Remove @${name}`}
                className="ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <IconX className="size-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
