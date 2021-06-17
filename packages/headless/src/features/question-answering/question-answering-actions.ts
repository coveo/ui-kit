import {createAction} from '@reduxjs/toolkit';

/**
 * Expand a smart snippet.
 */
export const expandSmartSnippet = createAction('smartSnippet/expand');
/**
 * Collapse a smart snippet.
 */
export const collapseSmartSnippet = createAction('smartSnippet/collapse');
/**
 * Like, or thumbs up, a smart snippet.
 */
export const likeSmartSnippet = createAction('smartSnippet/like');
/**
 * Dislike, or thumbs down, a smart snippet.
 */
export const dislikeSmartSnippet = createAction('smartSnippet/dislike');
