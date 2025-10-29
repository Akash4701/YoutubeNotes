
'use client'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import React, { useEffect, useState } from 'react';
import CommentItem from './AllComments';

// GraphQL queries and mutations
const ADD_COMMENT = gql`
  mutation AddComment($noteId: ID!, $comment: String!, $parentId: String) {
    createComment(noteId: $noteId, content: $comment, parentId: $parentId) {
      id
      content
      noteId
      parentId
      authorId
      author{
      name
      profilePic
      }
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
    authorId
    author{
    name
    profilePic
    }
    createdAt
    updatedAt
    parentId
    hasMoreReplies
    replyCount
  }
}

`;

const FETCH_NESTED_REPLIES = gql`
 query FetchNestedReplies($parentId: ID!) {
  fetchNestedReplies(parentId: $parentId) {
    id
    content
    authorId
    createdAt
    updatedAt
    author{
    name
    profilePic
    }
    parentId
    hasMoreReplies
    replyCount
  }
}

`;
type author={
  name:string;
  profilePic:string;

}
type Comment = {
  id: string;
  content: string;
  noteId?: string;
  parentId: string | null;
  replies: Comment[];
  authorId: string;
  author:author;
  createdAt: string;
  updatedAt: string;
  hasMoreReplies?: boolean;
  replyCount?: number;
};

type AddCommentMutationResult = {
  createComment: Comment;
};

type FetchCommentsQueryResult = {
  fetchAllComments: Comment[];
};

type FetchNestedRepliesResult = {
  fetchNestedReplies: Comment[];
};

function Comments({ noteId }: { noteId: string }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // Query for comments
 const { data, loading, error, refetch } = useQuery<FetchCommentsQueryResult>(
  FETCH_COMMENTS,
  {
    variables: {
       noteId                                          
       },
    skip: !noteId,
  }
);

// 👇 Add this to debug even when cache is used
React.useEffect(() => {
  if (data) {
    console.log('Fetched from backend or cache:', data);
    setComments(data.fetchAllComments);
  }
}, [data]);

  

  // Mutation for adding comments
  const [addCommentMutation, { loading: addCommentLoading }] = useMutation<AddCommentMutationResult>(
    ADD_COMMENT,
    {
      onCompleted: () => {
        // Refetch all comments to get updated tree structure
        refetch();
      },
      onError(error) {
        console.error('Error adding comment:', error.message);
      },
    }
  );

  // Mutation for fetching more nested replies
  const [fetchNestedReplies, { loading: isFetchingMore, data: nestedRepliesData }] =
  useLazyQuery<FetchNestedRepliesResult>(FETCH_NESTED_REPLIES, {
    fetchPolicy: 'network-only', // Always fetch from network to get latest replies
 
  });
  useEffect(() => {
  if (error) {
    console.error('Error fetching nested replies:', error.message);
  }
}, [error]);


  const addComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return;
    console.log('Adding comment:', content, parentId);

    try {
      await addCommentMutation({
        variables: {
          noteId,
          comment: content,
          parentId: parentId || null,
        },
      });

      setNewComment('');
      console.log('Comment Added Successfully');
    } catch (err: any) {
      console.error('Error adding comment:', err.message);
    }
  };

 const handleFetchMore = async (parentId: string) => {
  
  const { data } = await fetchNestedReplies({ variables: { parentId } });
  if (!data?.fetchNestedReplies) return;

  const updateCommentTree = (list: Comment[]): Comment[] =>
    list.map((c) =>
      c.id === parentId
        ? { ...c, replies: data.fetchNestedReplies, hasMoreReplies: false }
        : { ...c, replies: c.replies ? updateCommentTree(c.replies) : [] }
    );

  setComments(updateCommentTree(comments));
};


  console.log('commentsData', comments);

  return (
    <div className="w-full  mx-auto px-4 py-8">
      {/* Comment Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a comment</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 transition-all duration-200"
          rows={4}
        />

        <div className="flex justify-end mt-4">
          <button
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm"
            onClick={() => addComment(newComment, null)}
            disabled={addCommentLoading || !newComment.trim()}
          >
            {addCommentLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Post Comment'
            )}
          </button>
        </div>
      </div>

      {/* Comments List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Comments {comments?.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({comments.length})
              </span>
            )}
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600 font-medium">Loading comments...</p>
            </div>
          </div>
        )}

        {comments?.length ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={addComment}
                onFetchMore={handleFetchMore}
                isSubmitting={addCommentLoading}
                isFetchingMore={isFetchingMore}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 py-16 px-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-600 font-medium text-lg">No comments yet</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to share your thoughts!</p>
            </div>
          )
        )} 
      </div>
    </div>
  );
}

export default Comments;