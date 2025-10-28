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

      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        padding: 24px;
        min-height: 400px;
      }

      .product-card {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 20px;
        background: white;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border-color: #667eea;
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
        gap: 12px;
      }

      .result-title {
        flex: 1;
      }

      .result-title a {
        color: #1a73e8;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.1em;
        line-height: 1.4;
      }

      .result-title a:hover {
        text-decoration: underline;
      }

      .result-object-type {
        background: #e3f2fd;
        color: #1565c0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75em;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .result-grid {
        padding: 10px;
      }

      .result-excerpt {
        color: #555;
        line-height: 1.5;
        margin-bottom: 16px;
        font-size: 0.95em;
      }

      .result-metadata {
        margin-bottom: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #667eea;
      }

      .result-card {
        padding: 4px 0;
      }

      .result-metadata > div {
        margin-bottom: 4px;
        font-size: 0.85em;
        color: #495057;
      }

      .result-metadata strong {
        color: #333;
        font-weight: 600;
      }

      .product-image {
        width: 100%;
        height: 220px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 16px;
        background: #f8f9fa;
      }

      .product-name {
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        font-size: 1.1em;
        line-height: 1.4;
      }

      .product-brand {
        color: #6c757d;
        font-size: 0.9em;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .product-price {
        font-size: 1.4em;
        font-weight: 700;
        color: #28a745;
        margin-bottom: 8px;
      }

      .product-rating {
        color: #ffc107;
        margin-bottom: 8px;
        font-size: 0.9em;
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

      .query-error, .no-products {
        text-align: center;
        padding: 60px 40px;
        color: #6c757d;
        font-size: 1.2em;
      }

      @media (max-width: 768px) {
        .product-grid {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
