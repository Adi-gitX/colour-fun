// Image Generation Utility - Canvas-based High-Quality Export
export interface DownloadOptions {
    color: string;
    width: number;
    height: number;
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
    filename?: string;
}

export interface SizePreset {
    label: string;
    width: number;
    height: number;
    category: string;
}

export interface AspectRatio {
    label: string;
    ratio: string;
    presets: SizePreset[];
}

// All available aspect ratios with their presets
export const aspectRatios: AspectRatio[] = [
    {
        label: '16:9 Landscape',
        ratio: '16:9',
        presets: [
            { label: 'Full HD', width: 1920, height: 1080, category: 'Standard' },
            { label: '2K QHD', width: 2560, height: 1440, category: 'High Res' },
            { label: '4K UHD', width: 3840, height: 2160, category: 'Ultra HD' },
            { label: '5K', width: 5120, height: 2880, category: 'Ultra HD' },
            { label: '8K UHD', width: 7680, height: 4320, category: 'Maximum' },
        ],
    },
    {
        label: '9:16 Portrait',
        ratio: '9:16',
        presets: [
            { label: 'Mobile HD', width: 1080, height: 1920, category: 'Standard' },
            { label: 'Mobile 2K', width: 1440, height: 2560, category: 'High Res' },
            { label: 'Mobile 4K', width: 2160, height: 3840, category: 'Ultra HD' },
        ],
    },
    {
        label: '1:1 Square',
        ratio: '1:1',
        presets: [
            { label: 'Instagram', width: 1080, height: 1080, category: 'Social' },
            { label: '2K Square', width: 2048, height: 2048, category: 'High Res' },
            { label: '4K Square', width: 4096, height: 4096, category: 'Ultra HD' },
        ],
    },
    {
        label: '4:3 Standard',
        ratio: '4:3',
        presets: [
            { label: 'SXGA', width: 1280, height: 960, category: 'Standard' },
            { label: 'UXGA', width: 1600, height: 1200, category: 'Standard' },
            { label: '4K 4:3', width: 4096, height: 3072, category: 'Ultra HD' },
        ],
    },
    {
        label: '3:2 Photo',
        ratio: '3:2',
        presets: [
            { label: 'Photo HD', width: 1800, height: 1200, category: 'Standard' },
            { label: 'Photo 2K', width: 3000, height: 2000, category: 'High Res' },
            { label: 'Photo 6K', width: 6000, height: 4000, category: 'Ultra HD' },
        ],
    },
    {
        label: '21:9 Ultrawide',
        ratio: '21:9',
        presets: [
            { label: 'UWFHD', width: 2560, height: 1080, category: 'Standard' },
            { label: 'UWQHD', width: 3440, height: 1440, category: 'High Res' },
            { label: 'UW5K', width: 5120, height: 2160, category: 'Ultra HD' },
        ],
    },
    {
        label: '4:5 Instagram',
        ratio: '4:5',
        presets: [
            { label: 'IG Portrait', width: 1080, height: 1350, category: 'Social' },
            { label: 'IG Portrait 2K', width: 2160, height: 2700, category: 'High Res' },
        ],
    },
    {
        label: '3:4 Portrait',
        ratio: '3:4',
        presets: [
            { label: 'Standard', width: 1536, height: 2048, category: 'Standard' },
            { label: '4K Portrait', width: 3072, height: 4096, category: 'Ultra HD' },
        ],
    },
];

// Default preset
export const defaultPreset: SizePreset = {
    label: '4K UHD',
    width: 3840,
    height: 2160,
    category: 'Ultra HD',
};

// Generate and download image
export const generateAndDownload = async (options: DownloadOptions): Promise<void> => {
    const { color, width, height, format, quality = 1.0, filename } = options;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Fill with solid color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
    };

    const mimeType = mimeTypes[format] || 'image/png';

    // Generate blob
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b);
                else reject(new Error('Failed to generate image blob'));
            },
            mimeType,
            quality
        );
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename
    const colorName = color.replace('#', '').toUpperCase();
    const defaultFilename = `${colorName}_${width}x${height}.${format}`;

    link.href = url;
    link.download = filename || defaultFilename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
};

// Get file size estimate (in bytes)
export const estimateFileSize = (width: number, height: number, format: string): string => {
    const pixels = width * height;
    let bytes: number;

    switch (format) {
        case 'png':
            // PNG is lossless, estimate ~3 bytes per pixel for solid color (very low)
            bytes = pixels * 0.1; // Solid colors compress extremely well
            break;
        case 'jpeg':
            // JPEG at max quality
            bytes = pixels * 0.5;
            break;
        case 'webp':
            // WebP is efficient
            bytes = pixels * 0.3;
            break;
        default:
            bytes = pixels * 0.5;
    }

    // Format size
    if (bytes < 1024) return `${bytes.toFixed(0)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Calculate dimensions for aspect ratio
export const calculateDimensions = (
    aspectRatio: string,
    baseWidth: number
): { width: number; height: number } => {
    const [w, h] = aspectRatio.split(':').map(Number);
    const height = Math.round((baseWidth * h) / w);
    return { width: baseWidth, height };
};
