import type { SearchResult } from '../types';

interface Props {
  product: SearchResult;
}

export const ProductCard = ({ product }: Props) => {
  return (
    <div className="product-card">
      <div className="product-category">{product.category}</div>
      <div className="product-title">{product.title}</div>
      <div className="product-desc">{product.description}</div>
      
      <div className="product-footer">
        <div className="product-price">₹{product.price}</div>
        <div className="product-score">Match: {(product.score * 100).toFixed(1)}%</div>
      </div>

      {product.reasons && product.reasons.length > 0 && (
        <ul className="reasons-list">
          {product.reasons.map((reason, idx) => (
            <li key={idx}>• {reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
