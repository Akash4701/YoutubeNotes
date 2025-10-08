import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import React, { useState } from 'react';
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
    parentId
    hasMoreReplies
    replyCount
  }
}

`;

type Comment = {
  id: string;
  content: string;
  noteId?: string;
  parentId: string | null;
  replies: Comment[];
  authorId: string;
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
    variables: { noteId },
    skip: !noteId,
    onCompleted: (data) => {
      console.log('onCompleted called:', data);
      setComments(data.fetchAllComments);
    },
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
    onError(error) {
      console.error('Error fetching nested replies:', error.message);
    },
  });


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
    <div className="w-full mx-auto p-4">
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
          onClick={() => addComment(newComment, null)}
          disabled={addCommentLoading || !newComment.trim()}
        >
          {addCommentLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <h2 className="mt-6 mb-4 font-semibold text-lg">All Comments</h2>

      {loading && <p className="text-gray-500">Loading comments...</p>}

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
        !loading && <p className="text-gray-500">No comments yet.</p>
      )} 
    </div>
  );
}

export default Comments;