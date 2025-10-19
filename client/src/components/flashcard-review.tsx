import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, RotateCcw } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Flashcard } from "@shared/schema";

interface FlashcardReviewProps {
  flashcard: Flashcard;
  totalCards: number;
  currentIndex: number;
  onComplete: () => void;
  onExit: () => void;
}

export function FlashcardReview({
  flashcard,
  totalCards,
  currentIndex,
  onComplete,
  onExit,
}: FlashcardReviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const reviewMutation = useMutation({
    mutationFn: async (quality: number) => {
      return apiRequest("POST", "/api/flashcards/review", {
        flashcardId: flashcard.id,
        quality,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsFlipped(false);
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record review",
        variant: "destructive",
      });
    },
  });

  const handleReview = (quality: number) => {
    reviewMutation.mutate(quality);
  };

  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 bg-muted/30">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Card {currentIndex + 1} of {totalCards}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            data-testid="button-exit-review"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="perspective-1000">
          <Card
            className={`min-h-[400px] cursor-pointer transition-all duration-300 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={() => !reviewMutation.isPending && setIsFlipped(!isFlipped)}
            data-testid="card-flashcard-review"
          >
            <CardContent className="flex items-center justify-center min-h-[400px] p-12">
              <div className={`text-center ${isFlipped ? "rotate-y-180" : ""}`}>
                {!isFlipped ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Question</p>
                    <p className="text-2xl font-semibold">{flashcard.front}</p>
                    <p className="text-sm text-muted-foreground mt-8">
                      Click to reveal answer
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Answer</p>
                    <p className="text-xl">{flashcard.back}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {isFlipped && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground mb-2">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleReview(0)}
                disabled={reviewMutation.isPending}
                className="flex-1"
                data-testid="button-review-again"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">Again</span>
                  <span className="text-xs text-muted-foreground mt-1">&lt;1m</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview(3)}
                disabled={reviewMutation.isPending}
                className="flex-1"
                data-testid="button-review-hard"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">Hard</span>
                  <span className="text-xs text-muted-foreground mt-1">&lt;6m</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview(4)}
                disabled={reviewMutation.isPending}
                className="flex-1"
                data-testid="button-review-good"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">Good</span>
                  <span className="text-xs text-muted-foreground mt-1">&lt;10m</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReview(5)}
                disabled={reviewMutation.isPending}
                className="flex-1"
                data-testid="button-review-easy"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">Easy</span>
                  <span className="text-xs text-muted-foreground mt-1">4d</span>
                </div>
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Keyboard shortcuts: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
            </p>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
