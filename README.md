# AffinityBubble Pipeline Distribution

This repository contains the latest build of the AffinityBubble pipeline.

## Bundles

| Bundle | Description |
|--------|-------------|
| [affinitybubble.bundle.js](./affinitybubble.bundle.js) | 전체 파이프라인 (분석 + 시각화) |
| [affinitybubble-input.bundle.js](./affinitybubble-input.bundle.js) | 파일 입력 모듈만 (경량) |

## Usage in Observable

```javascript
// 전체 파이프라인
import { AffinityBubblePipeline, DataInput } from "https://raw.githack.com/pxd-uxtech/affinitybubble-dist/{COMMIT_HASH}/affinitybubble.bundle.js"

// 파일 입력만
import { DataInput } from "https://raw.githack.com/pxd-uxtech/affinitybubble-dist/{COMMIT_HASH}/affinitybubble-input.bundle.js"
```

- **Original Source**: [pxd-uxtech/affinitybubble-observable](https://github.com/pxd-uxtech/affinitybubble-observable)
