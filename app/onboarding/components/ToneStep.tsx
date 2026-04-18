'use client';

import { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TONE_OPTIONS = [
  'Casual',
  'Professional',
  'Opinionated',
  'Educational',
  'Witty',
  'Motivational',
];

export function ToneStep() {
  const { formData, updateFormData } = useFormContext();
  const [pastPosts, setPastPosts] = useState(formData.pastPosts || '');
  const selectedTone = formData.selectedTone || '';

  const handleToneSelect = (tone: string) => {
    updateFormData({
      selectedTone: tone,
    });
  };

  const handlePastPostsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPastPosts(value);
    updateFormData({
      pastPosts: value,
    });
  };

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          How do you <em>sound</em>?
        </h2>
        <p className="text-muted-foreground">
          We'll use this to match your tone so posts actually feel like you
          wrote them.
        </p>
      </div>

      {/* Tone Selection */}
      <div className="flex flex-col gap-3">
        <Label className="font-medium">Tone</Label>
        <div className="flex flex-wrap gap-3">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              onClick={() => handleToneSelect(tone)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedTone === tone
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Past Posts Textarea */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="past-posts" className="font-medium">
          Paste 1-2 of your past posts{' '}
          <span className="font-normal text-muted-foreground">
            (optional but recommended)
          </span>
        </Label>
        <Textarea
          id="past-posts"
          placeholder="e.g. Most founders confuse activity with progress. Shipping 10 features nobody asked for isn't momentum..."
          value={pastPosts}
          onChange={handlePastPostsChange}
          className="min-h-32 min-w-200"
        />
      </div>

      {/* Selection Summary */}
      {selectedTone && (
        <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium">Your tone: {selectedTone}</p>
        </div>
      )}
    </div>
  );
}
