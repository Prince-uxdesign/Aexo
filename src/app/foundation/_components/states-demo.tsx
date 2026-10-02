"use client";

import { FileText } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingDots,
  LoadingState,
  Skeleton,
  iconSize,
  iconStroke,
} from "@/components/ui";
import { Demo } from "./demo-helpers";

export function StatesDemo() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-4 lg:grid-cols-3">
        <Demo title="Skeleton">
          <Card padding="compact" aria-busy className="flex flex-col gap-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="size-10 rounded-pill" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <LoadingDots label="Loading invoices" className="mt-1 text-muted-soft" />
          </Card>
        </Demo>
        <Demo title="Empty state">
          <Card padding="none">
            <EmptyState
              titleAs="h4"
              icon={<FileText size={iconSize.lg} strokeWidth={iconStroke} />}
              title="No invoices yet."
              description="Create your first invoice and it will appear here."
              action={<Button>Create Invoice</Button>}
            />
          </Card>
        </Demo>
        <Demo title="Error state">
          <Card padding="none">
            <ErrorState
              titleAs="h4"
              title="Could not load invoices."
              description="Check your connection and try again."
              action={<Button variant="secondary">Try again</Button>}
            />
          </Card>
        </Demo>
      </div>
      <Demo title="Loading state">
        <Card padding="none">
          <LoadingState message="Preparing your preview" />
        </Card>
      </Demo>
    </div>
  );
}
