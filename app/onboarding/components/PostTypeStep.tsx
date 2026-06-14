'use client';

import { useFormContext } from '../context/FormContext';
import { Button } from '@/components/ui/button';
import { BASE_POST_TYPES } from '@/lib/constants/post-types';

export function PostTypeStep() {
  const { formData, updateFormData } = useFormContext();
  const selected: string[] = formData.postType || [];
  // Use the X-analysis suggestions when present; otherwise fall back to the
  // default post types (e.g. the user skipped connecting their X account).
  const types: readonly string[] = formData.suggestedPostTypes?.length
    ? formData.suggestedPostTypes
    : BASE_POST_TYPES;

  const handleToggle = (type: string) => {
    const isSelected = selected.includes(type);
    const updated = isSelected
      ? selected.filter((t) => t !== type)
      : [...selected, type];

    updateFormData({ postType: updated });
  };

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl text-center sm:text-left">
          What do you want to <em>post</em>?
        </h2>
        <p className="text-muted-foreground">
          Pick the kinds of posts you want us to generate.
        </p>
      </div>

      {/* Post Type Chips */}
      <div>
        <div className="flex flex-wrap gap-3">
          {types.map((type) => (
            <Button
              key={type}
              onClick={() => handleToggle(type)}
              variant={selected.includes(type) ? 'default' : 'outline'}
              className="rounded-full min-h-11 max-sm:text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
