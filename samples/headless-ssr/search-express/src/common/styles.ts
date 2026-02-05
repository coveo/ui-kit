export function getSharedStyles(): string {
  return `<style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }

      .app-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        background-color: white;
        min-height: 100vh;
      }

      .app-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
      }

      .app-header h1 {
        margin: 0 0 10px 0;
        font-size: 2.5em;
        font-weight: 700;
      }

      .subtitle {
        margin: 0;
        font-size: 1.2em;
        opacity: 0.9;
      }

      .search-section {
        margin-bottom: 40px;
        padding: 0 20px;
      }

      .search-box {
        display: flex;
        gap: 12px;
        max-width: 700px;
        margin: 0 auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
      }

      #search-input {
        flex: 1;
        padding: 16px 20px;
        border: none;
        font-size: 16px;
        outline: none;
      }

      #search-button {
        padding: 16px 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      #search-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .main-results {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
        overflow: hidden;
        margin: 0 20px;
      }

      .results-header {
        padding: 24px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
      }

      .results-controls {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .query-summary {
        font-size: 1.1em;
        font-weight: 500;
        color: #495057;
        text-align: center;
      }

      .result-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 24px;
        min-height: 400px;
      }

      .result-card {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        background: white;
        transition: all 0.3s ease;
        position: relative;
      }

      .result-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #667eea;
      }

      .result-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        font-size: 1.2em;
        line-height: 1.4;
      }

      .result-excerpt {
        color: #6c757d;
        font-size: 0.95em;
        margin-bottom: 12px;
        line-height: 1.6;
      }

      .result-link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.9em;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: color 0.2s ease;
      }

      .result-link:hover {
        color: #764ba2;
        text-decoration: underline;
      }

      .pagination {
        padding: 24px;
        text-align: center;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }

      .load-more-btn {
        padding: 16px 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
      }

      .load-more-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .load-more-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .app-footer {
        text-align: center;
        margin-top: 60px;
        padding: 30px 0;
        border-top: 1px solid #e9ecef;
        color: #6c757d;
        font-size: 1.1em;
      }

      .query-error, .no-results {
        text-align: center;
        padding: 60px 40px;
        color: #6c757d;
        font-size: 1.2em;
      }

      @media (max-width: 768px) {
        .result-list {
          gap: 16px;
          padding: 16px;
        }
        
        .search-box {
          flex-direction: column;
        }
        
        .app-header h1 {
          font-size: 2em;
        }
        
        .main-results {
          margin: 0 10px;
        }
      }
    </style>`;
}
