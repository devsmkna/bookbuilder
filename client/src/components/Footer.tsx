import React from "react";

interface FooterProps {
  wordCount: number;
  charCount: number;
}

export default function Footer({ wordCount, charCount }: FooterProps) {
  return (
    <footer className="py-4 border-t border-border">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Markdown WYSIWYG Editor</div>
          <div className="flex space-x-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
