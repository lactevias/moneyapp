import { Button } from "@/components/ui/button";

interface Space {
  id: string;
  name: string;
  type: 'personal' | 'business';
}

interface FinanceHeaderProps {
  spaces: Space[];
  currentSpaceId: string | null;
  onSpaceChange: (spaceId: string) => void;
  userId?: string;
  appId?: string;
}

export default function FinanceHeader({ spaces, currentSpaceId, onSpaceChange, userId, appId }: FinanceHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Привет, <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Нина</span>
          </h1>
          <p className="text-muted-foreground text-lg">Управляй потоком своей финансовой энергии</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-card-border shadow-glow">
            {spaces.map((space) => (
              <Button
                key={space.id}
                data-testid={`button-space-${space.id}`}
                size="sm"
                variant={currentSpaceId === space.id ? "default" : "ghost"}
                onClick={() => onSpaceChange(space.id)}
                className={currentSpaceId === space.id ? "shadow-glow" : ""}
              >
                {space.name}
              </Button>
            ))}
          </div>
          
          {userId && appId && (
            <div className="text-xs text-muted-foreground font-mono">
              ID: {userId.substring(0, 8)}... | App: {appId.substring(0, 12)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
