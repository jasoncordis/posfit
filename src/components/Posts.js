import React from "react";
console.log("POSTS");
const Posts = ({ postsToRender }) => {return (
    <ul>
      {postsToRender.map((post, index) => (
        <li key={index}>
          <strong>{post.id}</strong>
          &nbsp;{post.title}
        </li>
      ))}
    </ul>
  );
};
export default Posts;