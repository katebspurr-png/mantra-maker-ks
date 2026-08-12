import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteRecordingDialog } from "./DeleteRecordingDialog";
import { useDeleteRecording } from "@/hooks/useDeleteRecording";
import { Recording } from "@/types";
import { downloadRecording } from "@/lib/downloadRecording";
import { useToast } from "@/hooks/use-toast";

interface RecordingOptionsMenuProps {
  recording: Recording;
  onDeleted?: () => void;
  onRename?: () => void;
  showRename?: boolean;
}

export function RecordingOptionsMenu({
  recording,
  onDeleted,
  onRename,
  showRename = false,
}: RecordingOptionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const { deleteRecording, isDeleting } = useDeleteRecording({
    onSuccess: () => {
      setShowDeleteDialog(false);
      onDeleted?.();
    },
  });

  const handleDelete = () => {
    deleteRecording(recording.id, recording.audio_file_path);
  };

  const handleDownload = async (e: Event) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      await downloadRecording(recording);
    } catch (err) {
      toast({
        title: "Download failed",
        description: String((err as Error)?.message ?? err),
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showRename && onRename && (
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteRecordingDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
