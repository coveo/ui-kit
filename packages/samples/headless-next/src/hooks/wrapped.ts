'use client';

// import {use} from 'react';

// const wrapHook = <TName extends keyof typeof import('react')>(hook: TName) =>
//   ((...args: unknown[]) =>
//     use(
//       import('react').then((r) => r[hook]) as unknown as Promise<
//         (...args: unknown[]) => unknown
//       >
//     )(...args)) as typeof import('react')[TName];

// export const useContext = wrapHook('useContext');
// export const useCallback = wrapHook('useCallback');
// export const useEffect = wrapHook('useEffect');
// export const useReducer = wrapHook('useReducer');
// export const useRef = wrapHook('useRef');
// export const useMemo = wrapHook('useMemo');

export {
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useMemo,
} from 'react';
