import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Flashcard } from "@shared/schema";
import { FlashcardReview } from "@/components/flashcard-review";
import { CreateFlashcardDialog } from "@/components/create-flashcard-dialog";

export default function Flashcards() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: flashcards = [], isLoading } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards"],
  });

  const dueFlashcards = flashcards.filter(
    (card) => new Date(card.nextReview) <= new Date()
  );

  const handleReviewComplete = () => {
    if (currentIndex < dueFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsReviewing(false);
      setCurrentIndex(0);
      toast({
        title: "Review Complete!",
        description: `You reviewed ${dueFlashcards.length} flashcard${dueFlashcards.length !== 1 ? 's' : ''}`,
      });
    }
  };

  const startReview = () => {
    if (dueFlashcards.length === 0) {
      toast({
        title: "No cards due",
        description: "Great job! Come back later for more reviews.",
      });
      return;
    }
    setIsReviewing(true);
    setCurrentIndex(0);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-20 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isReviewing && dueFlashcards.length > 0) {
    return (
      <FlashcardReview
        flashcard={dueFlashcards[currentIndex]}
        totalCards={dueFlashcards.length}
        currentIndex={currentIndex}
        onComplete={handleReviewComplete}
        onExit={() => {
          setIsReviewing(false);
          setCurrentIndex(0);
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Flashcards</h1>
            <p className="text-muted-foreground">
              {flashcards.length} total cards · {dueFlashcards.length} due for review
            </p>
          </div>
          <div className="flex gap-2">
            {dueFlashcards.length > 0 && (
              <Button onClick={startReview} data-testid="button-start-review">
                <RotateCcw className="h-4 w-4 mr-2" />
                Review ({dueFlashcards.length})
              </Button>
            )}
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-flashcard">
              <Plus className="h-4 w-4 mr-2" />
              Create Flashcard
            </Button>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Flashcards Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start chatting with the AI to automatically generate flashcards, or create one manually.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flashcard
                </Button>
                <Button variant="outline" asChild>
                  <a href="/chat">Start Chatting</a>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((card) => {
              const isDue = new Date(card.nextReview) <= new Date();
              return (
                <Card key={card.id} className="hover-elevate" data-testid={`card-flashcard-${card.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-3">{card.front}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {card.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {isDue && (
                        <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                          Due
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isDue ? "Ready for review" : `Next review: ${new Date(card.nextReview).toLocaleDateString()}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CreateFlashcardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
}
