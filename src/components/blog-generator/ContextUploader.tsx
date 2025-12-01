import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mammoth from "mammoth";

interface ContextUploaderProps {
  contextContent: string;
  setContextContent: (content: string) => void;
}

export function ContextUploader({ contextContent, setContextContent }: ContextUploaderProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    try {
      let extractedText = "";

      if (file.name.endsWith('.txt')) {
        // Handle plain text files
        extractedText = await file.text();
      } else if (file.name.endsWith('.docx')) {
        // Handle DOCX files using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a .txt or .docx file",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setContextContent(extractedText);
      toast({
        title: "Success",
        description: `Context loaded from ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setContextContent("");
    setFileName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Context Document (Optional)
        </CardTitle>
        <CardDescription>
          Upload a DOCX or text file to use as reference context for generating your blog post. 
          The AI will use this content to better understand your topic and writing style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="context-file">Upload Reference Document</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('context-file')?.click()}
              disabled={isProcessing}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : fileName ? "Change File" : "Choose File"}
            </Button>
            <input
              id="context-file"
              type="file"
              accept=".txt,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              <span>{fileName}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="context-content">Context Content</Label>
          <Textarea
            id="context-content"
            value={contextContent}
            onChange={(e) => setContextContent(e.target.value)}
            placeholder="Upload a file or paste your reference content here..."
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {contextContent.length > 0 
              ? `${contextContent.length} characters • ${contextContent.split(/\s+/).length} words`
              : "No context loaded"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
