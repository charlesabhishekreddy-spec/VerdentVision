
'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Skeleton } from './ui/skeleton';

export function ShareQrCode() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this only runs on the client-side
    setUrl(window.location.href);
  }, []);

  if (!url) {
    return <Skeleton className="w-[256px] h-[256px] mx-auto" />;
  }

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg">
      <QRCodeSVG
        value={url}
        size={256}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
    </div>
  );
}
