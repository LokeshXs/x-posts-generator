"use client";

import { FormProvider, useFormContext } from '../context/FormContext';
import { NicheStep } from './NicheStep';
import { ToneStep } from './ToneStep';
import { ScheduleStep } from './ScheduleStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FormStep } from '../context/FormContext';

// Define the form steps
const FORM_STEPS: FormStep[] = [
  {
    id: 'niche',
    title: "What's your niche?",
    description:
      'Pick the topics you post about. This helps us find the right trends for you.',
  },
  {
    id: 'tone',
    title: 'How do you sound?',
    description:
      'We will use this to match your tone so posts actually feel like you wrote them.',
  },
  {
    id: 'schedule',
    title: 'Set your schedule',
    description:
      'When should we generate and deliver your posts?',
  },
];

export default function MultistepForm() {
  return (
    <FormProvider
      steps={FORM_STEPS}
      initialData={{
        selectedTopics: [],
        customNiche: '',
        selectedTone: '',
        pastPosts: '',
        postsPerDay: '1',
        deliveryTime: '08:00',
        postFormat: 'single',
      }}
    >
      <MultistepFormContent />
    </FormProvider>
  );
}

function MultistepFormContent() {
  const { currentStep, totalSteps, goToNextStep, goToPreviousStep, canGoNext, canGoPrevious } = useFormContext();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Step content */}
      <Card>
        <CardHeader>
          <div className="text-xs text-muted-foreground font-medium">
            STEP {currentStep + 1} OF {totalSteps}
          </div>
        </CardHeader>
        <CardContent >
          <FormStepContent />
        </CardContent>
      </Card>

      {/* Step counter and navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={!canGoPrevious()}
        >
          Back
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} / {totalSteps}
        </span>
        <Button onClick={goToNextStep}>
          {currentStep === totalSteps - 1 ? 'Finish setup →' : 'Continue →'}
        </Button>
      </div>
    </div>
  );
}

function FormStepContent() {
  const { currentStep } = useFormContext();

  switch (currentStep) {
    case 0:
      return <NicheStep />;
    case 1:
      return <ToneStep />;
    case 2:
      return <ScheduleStep />;
    default:
      return <NicheStep />;
  }
}
