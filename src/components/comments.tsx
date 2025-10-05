import { useMutation, useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import React, { useState } from 'react';
import AllComments from './AllComments';

// Define GraphQL queries/mutations outside component for better performance
const ADD_COMMENT = gql`
  mutation AddComment($noteId: ID!, $comment: String!, $parentId: String) {
    createComment(noteId: $noteId, content: $comment, parentId: $parentId) {
      id
      content
      noteId
      parentId
      authorId
      createdAt
      updatedAt
    }
  }
`;

const FETCH_COMMENTS = gql`
  query FetchAllComments($noteId: ID!) {
    fetchAllComments(noteId: $noteId) {
    
      id
      content
      replies{
          id
          content
          parentId
          authorId
          createdAt
          updatedAt
      }
      authorId
      parentId
      createdAt
      updatedAt
    }
  }
`;

type Comment = {
  id: string;
  content: string;
  noteId: string;
  parentId: string | null;
  replies: {
    id: string;
    content: string;
    parentId: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
};


type AddCommentMutationResult = {
  createComment: Comment;
};

type FetchCommentsQueryResult = {
  fetchAllComments: Comment[];
};

function Comments({ noteId }: { noteId: string }) {
  const [newComment, setNewComment] = useState('');

  // Query for comments
  const {
    loading: fetchingComments,
    data: commentsData,
  } = useQuery<FetchCommentsQueryResult>(FETCH_COMMENTS, {
    variables: { noteId },
    skip: !noteId,
  });

  // Mutation for adding comments
  const [addCommentMutation, { loading: addCommentLoading }] = useMutation<AddCommentMutationResult>(
    ADD_COMMENT,
    {
      update(cache, { data }) {
        const newCommentData = data?.createComment;
        if (!newCommentData) return;

        try {
          // Read the existing comments from the cache
          const existingData = cache.readQuery<FetchCommentsQueryResult>({
            query: FETCH_COMMENTS,
            variables: { noteId },
          });

          // Write updated data back to cache
          if (existingData?.fetchAllComments) {
            cache.writeQuery({
              query: FETCH_COMMENTS,
              variables: { noteId },
              data: {
                fetchAllComments: [newCommentData, ...existingData.fetchAllComments],
              },
            });
          }
        } catch (error) {
          console.error('Cache update error:', error);
        }
      },
      onError(error) {
        console.error('Error adding comment:', error.message);
      },
    }
  );

  const addComment = async (content:string,parentId:string | null=null) => {
    if (!content.trim()) return;
    console.log('object', content,parentId);
    
    try {
      await addCommentMutation({
        variables: {
          noteId,
          comment: content,
          parentId: null,
        },
      });

      setNewComment('');
      console.log('Comment Added Successfully');
 
    } catch (err: any) {
      console.error('Error adding comment:', err.message);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={()=>addComment(newComment,null)}
          disabled={addCommentLoading || !newComment.trim()}
        >
          {addCommentLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <h2 className="mt-6 mb-4 font-semibold text-lg">All Comments</h2>

      {fetchingComments && <p className="text-gray-500">Loading comments...</p>}

      {commentsData?.fetchAllComments?.length ? (
        <ul className="space-y-3">
          {commentsData.fetchAllComments.map((comment) => (
            <AllComments key={comment.id} comment={comment} onReply={addComment}/>

           
          ))}
        </ul>
      ) : (
        !fetchingComments && <p className="text-gray-500">No comments yet.</p>
      )}
    </div>
  );
}

export default Comments;