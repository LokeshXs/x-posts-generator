'use client';

import { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NICHE_TOPICS = [
  'AI & Tech',
  'Startups',
  'Marketing',
  'Finance',
  'Design',
  'Fitness',
  'SaaS',
  'Web3',
  'Creator Economy',
  'Leadership',
];

export function NicheStep() {
  const { formData, updateFormData } = useFormContext();
  const [customNiche, setCustomNiche] = useState(
    formData.customNiche || ''
  );
  const selectedTopics = formData.selectedTopics || [];

  const handleTopicToggle = (topic: string) => {
    const updated = selectedTopics.includes(topic)
      ? selectedTopics.filter((t: string) => t !== topic)
      : [...selectedTopics, topic];

    updateFormData({
      selectedTopics: updated,
    });
  };

  const handleCustomNicheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomNiche(value);
    updateFormData({
      customNiche: value,
    });
  };

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          What's your <em>niche</em>?
        </h2>
        <p className="text-muted-foreground">
          Pick the topics you post about. This helps us find the right trends
          for you.
        </p>
      </div>

      {/* Topic Chips */}
      <div>
        <div className="flex flex-wrap gap-3">
          {NICHE_TOPICS.map((topic) => (
            <Button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
              className="rounded-full"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <Separator className="my-2" />
      <p className="text-xs uppercase text-muted-foreground text-center">
        Or
      </p>
      <Separator className="my-2" />

      {/* Custom Niche Input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="custom-niche">
          Describe your niche in your own words
        </Label>
        <Input
          id="custom-niche"
          type="text"
          placeholder="e.g. B2B sales for early-stage startups"
          value={customNiche}
          onChange={handleCustomNicheChange}
        />
      </div>

      {/* Selection Summary */}
      {(selectedTopics.length > 0 || customNiche) && (
        <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium">Your selections:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTopics.map((topic: string) => (
              <Badge key={topic} variant="default">
                {topic}
              </Badge>
            ))}
            {customNiche && (
              <Badge variant="default">
                {customNiche}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
