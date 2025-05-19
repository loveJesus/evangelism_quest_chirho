
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
  if (!isOpenChirho || !imageUrlChirho) {
    return null;
  }

  return (
    <Dialog open={isOpenChirho} onOpenChange={(open) => { if (!open) onCloseChirho(); }}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Persona Snapshot</DialogTitle>
        </DialogHeader>
        {imageUrlChirho && (
          <div className="relative w-full aspect-[4/3] my-4 rounded-lg overflow-hidden bg-muted">
            <Image
              src={imageUrlChirho}
              alt="Persona snapshot at the time of message"
              fill
              style={{ objectFit: 'contain' }}
              unoptimized={!!(typeof imageUrlChirho === 'string' && imageUrlChirho.startsWith('data:image'))}
              data-ai-hint="person portrait"
            />
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
