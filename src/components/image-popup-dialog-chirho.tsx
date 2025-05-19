
"use client";

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImagePopupDialogPropsChirho {
  isOpenChirho: boolean;
  onCloseChirho: () => void;
  imageUrlChirho: string | null;
}

export function ImagePopupDialogChirho({ isOpenChirho, onCloseChirho, imageUrlChirho }: ImagePopupDialogPropsChirho) {
  // The Dialog component itself handles visibility based on the `open` prop.
  // We only need to conditionally render the image *inside* if imageUrlChirho is present.

  return (
    <Dialog open={isOpenChirho} onOpenChange={(open) => { if (!open) onCloseChirho(); }}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Persona Snapshot</DialogTitle>
        </DialogHeader>
        {imageUrlChirho ? (
          <div className="relative w-full aspect-[4/3] my-4 rounded-lg overflow-hidden bg-muted">
            <Image
              key={imageUrlChirho} // Add key to ensure Image component updates if URL changes
              src={imageUrlChirho}
              alt="Persona snapshot at the time of message"
              fill
              style={{ objectFit: 'contain' }}
              unoptimized={!!(typeof imageUrlChirho === 'string' && imageUrlChirho.startsWith('data:image'))}
              data-ai-hint="person portrait"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground my-4">
            Image not available.
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCloseChirho}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
