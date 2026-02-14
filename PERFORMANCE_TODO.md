# Performance Optimization Implementation Plan

## Overview
This document outlines the comprehensive performance optimization implementation for the Kaduna Court Management System frontend. The goal is to achieve <3s LCP, reduce bundle size via code splitting, eliminate unnecessary re-renders with TanStack Query caching, implement progressive loading patterns, and add resilience against runtime errors while maintaining FITS compliance.

---

## Phase 1: Build Optimizations & Code Splitting ✅ COMPLETE

### Completed Tasks:
- [x] Install and configure @vitejs/plugin-legacy for legacy browser support
- [x] Install rollup-plugin-visualizer for bundle analysis
- [x] Install vite-plugin-compression2 for brotli/gzip compression
- [x] Configure manualChunks in vite.config.ts:
  - react-vendor: React, ReactDOM, React Router
  - ui-vendor: Recharts, Lucide React
  - data-vendor: TanStack Query
- [x] Convert all dashboard components to default exports for React.lazy()
- [x] Install terser for minification
- [x] Fix TypeScript errors in performance.ts

### Build Results:
```
✓ Built in 23.02s
✓ 1791 modules transformed

Bundle Analysis:
- react-vendor: ~160KB (gzipped: ~53KB)
- index (main): ~114KB (gzipped: ~33KB)
- data-vendor: ~29KB (gzipped: ~9KB)
- ui-vendor: ~33KB (gzipped: ~7KB)
- AdminDashboard: ~31KB (gzipped: ~7KB)
- CaseDetailPage: ~30KB (gzipped: ~7KB)
- All other pages: <20KB each

Compression:
- Brotli (.br) and Gzip (.gz) files generated
- Service worker: 4.3KB → 1.2KB (br) / 1.4KB (gz)
```

### Files Modified:
1. vite.config.ts - Added legacy plugin, visualizer, compression, manualChunks
2. package.json - Added performance dependencies
3. All dashboard components - Converted to default exports
4. src/utils/performance.ts - Fixed TypeScript errors

---

## Phase 2: TanStack Query Implementation ✅ COMPLETE

### Completed Tasks:
- [x] Install @tanstack/react-query and devtools
- [x] Create src/queryClient.ts with optimized configuration
- [x] Create src/hooks/useCases.ts with 8 query hooks
- [x] Update src/App.tsx with QueryClientProvider
- [x] Configure staleTime (5min) and gcTime (10min)

### Query Hooks Created:
1. useCases(filters) - List cases with filtering
2. useCase(id) - Single case details
3. useCreateCase() - Create with optimistic update
4. useUpdateCase() - Update with optimistic update
5. useDeleteCase() - Delete with optimistic update
6. useAssignLawyer() - Assignment mutation
7. useScheduleHearing() - Hearing scheduling
8. useRequestCaseAssignment() - Assignment requests
9. usePrefetchCase() - Prefetching for navigation

### Configuration:
```typescript
staleTime: 5 * 60 * 1000,    // 5 minutes
gcTime: 10 * 60 * 1000,     // 10 minutes
retry: 3,
refetchOnWindowFocus: false,
```

---

## Phase 3: Advanced Performance Hooks ✅ COMPLETE

### Completed Tasks:
- [x] Create src/hooks/useIntersectionObserver.ts
- [x] Create src/hooks/useDebounce.ts
- [x] Create src/components/LazyImage.tsx
- [x] Create src/components/VirtualizedList.tsx
- [x] Create src/components/ErrorBoundary.tsx
- [x] Create src/utils/performance.ts

### Hooks Implemented:
1. useIntersectionObserver - Lazy loading detection
2. useLazyImage - Image lazy loading with blur-up
3. useInfiniteScroll - Infinite scroll pagination
4. useDebounce - Input debouncing
5. useDebouncedCallback - Callback debouncing
6. useThrottledCallback - Throttling
7. useSearchDebounce - Search-specific debouncing

### Components Created:
1. LazyImage - Optimized image loading
2. ResponsiveImage - Srcset support
3. VirtualizedList - Large list virtualization
4. ErrorBoundary - Error catching and recovery
5. AsyncErrorBoundary - Async error handling

---

## Phase 4: Integration & Testing 🔄 IN PROGRESS

### Remaining Tasks:
- [ ] Integrate useCases hooks into dashboard components
- [ ] Replace existing data fetching with TanStack Query
- [ ] Add ErrorBoundary wrappers to all routes
- [ ] Implement lazy loading for images
- [ ] Add virtualized lists for large datasets
- [ ] Test all functionality
- [ ] Run Lighthouse audit
- [ ] Verify Core Web Vitals

### Next Steps:
1. Update LawyerDashboard to use useCases hook
2. Update CaseManagementPage with virtualization
3. Add ErrorBoundary to route components
4. Implement image lazy loading in document repository
5. Test and measure performance improvements

---

## Dependencies Added

```json
{
  "@tanstack/react-query": "^5.62.0",
  "@tanstack/react-query-devtools": "^5.62.0",
  "@vitejs/plugin-legacy": "^5.4.0",
  "rollup-plugin-visualizer": "^5.12.0",
  "vite-plugin-compression2": "^1.3.0",
  "intersection-observer": "^0.12.2",
  "web-vitals": "^4.2.4",
  "terser": "^5.37.0"
}
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | <3s | TBD |
| FID | <100ms | TBD |
| CLS | <0.1 | TBD |
| TTFB | <600ms | TBD |
| Bundle Size | <500KB | ~350KB (gzipped) |

---

## Build Commands

```bash
# Development
npm run dev

# Production build with analysis
npm run build

# Preview production build
npm run preview

# Bundle analysis
open dist/stats.html
```

---

## Notes

- Legacy browser support enabled via @vitejs/plugin-legacy
- Brotli and Gzip compression enabled for all assets
- Code splitting working - each page is a separate chunk
- Service worker caching strategy in place
- FITS compliance maintained with legacy polyfills
