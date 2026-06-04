import React from 'react';

export const FeedHeader = () => {
  return (
    <header className="feed-header">
      <div className="feed-header-tabs">
        <button type="button" className="feed-header-tab active">
          For You
        </button>
        <button type="button" className="feed-header-tab">
          Following
        </button>
      </div>
    </header>
  );
};

export default FeedHeader;
