import { useMutation } from '@apollo/client/react';
import gql from 'graphql-tag';
import React, { useState } from 'react'

function Comments({noteId}:{noteId:string}) {
  const ADD_COMMENT=gql`
  mutation AddComment($noteId: ID!, $comment: String!, $parentId: String) {
  createComment(noteId: $noteId, content: $comment, parentId: $parentId) {
    id
    content
    noteId
    parentId
    authorId
    createdAt
  }
}
`
   const [addCommentMutation,{loading:addCommentloading}]=useMutation(ADD_COMMENT);


  const [newComment,setNewComment]=useState('');
  const addComment=async()=>{
    console.log('newComment',newComment);
    try{
      await addCommentMutation({
        variables:{
          noteId,
          comment:newComment,
          parentId: null,
        }
      })

      console.log('Comment added successfully');
      setNewComment('')
    }catch(err){
      console.log('Error adding comment',err.message);
    }


  }

  return (
    <div>
      <textarea
      value={newComment}
      onChange={(e)=>setNewComment(e.target.value)}
      placeholder='Add a Comment'
      className='w-full p-2 border rounded'>


      </textarea>
      <button className='px-4 py-2 bg-blue-500 text-white rounded mt-2 hover:bg-blue-600 transition' onClick={addComment}>Submit</button>

      
    </div>
  )
}

export default Comments