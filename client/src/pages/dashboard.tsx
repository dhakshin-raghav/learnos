import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Track your learning progress and stay on top of your reviews
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card data-testid="card-total-flashcards">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Flashcards</CardTitle>
              <Brain className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-flashcards">
                {stats?.totalFlashcards || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active learning cards
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-due-today">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Calendar className="h-8 w-8 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4" data-testid="text-due-today">
                {stats?.flashcardsDueToday || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cards to review
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-notes">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-notes">
                {stats?.totalNotes || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Knowledge base entries
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-review-streak">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Review Streak</CardTitle>
              <TrendingUp className="h-8 w-8 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3" data-testid="text-review-streak">
                {stats?.reviewStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Start a Learning Session</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with the AI tutor to learn new topics. The AI will automatically create flashcards and notes from your conversations.
              </p>
              <a
                href="/chat"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover-elevate active-elevate-2"
                data-testid="link-start-chat"
              >
                Start Chatting
              </a>
            </div>
            
            {stats && stats.flashcardsDueToday > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Review Flashcards</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have {stats.flashcardsDueToday} flashcard{stats.flashcardsDueToday !== 1 ? 's' : ''} due for review today. Keep your streak going!
                </p>
                <a
                  href="/flashcards"
                  className="inline-flex items-center justify-center rounded-md bg-chart-4 px-4 py-2 text-sm font-medium text-white hover-elevate active-elevate-2"
                  data-testid="link-review-flashcards"
                >
                  Review Now
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
