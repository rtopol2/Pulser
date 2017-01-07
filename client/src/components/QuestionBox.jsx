import React, { Component } from 'react';
import { connect } from 'react-redux';
import Question from './Question';
import $ from 'jquery';

class QuestionBox extends Component {
// This component lets users enter questions; it also displays each individual question component
  constructor (props) {
    super();
    let dispatch = props.dispatch;
    let render = this.forceUpdate.bind(this);
    this.socket = props.activeLecture.socket;
    this.socket.on('upvoteQuestion', function (upvote) {
      dispatch({
        type: 'UPVOTE',
        questionId: upvote.questionId
      });
      render();
    });
    this.socket.on('downvoteQuestion', function (downvote) {
      dispatch({
        type: 'DOWNVOTE',
        questionId: downvote.questionId
      });
      render();
    });
    this.socket.on('submitQuestion', function (question) {
      console.log('question received', question);
      dispatch({
        type: 'CREATE_QUESTION',
        questionText: question.questionText,
        questionId: question.questionId
      });
      render();
    });
  }

  submitQuestion () {
    console.log('submitQuestion event fired');
    // dispatch, submission to the db, socket to the presenter
    let socket = this.props.activeLecture.socket;
    let dispatch = this.props.dispatch;
    let questionText = $('#questionInput').val();
    $('#questionInput').val('');
    console.log(questionText);
    let lectureId = this.props.activeLecture.lectureId;
    let userId = this.props.user.id;
    let questionId = (Math.random().toString(36) + '00000000000000000').slice(2, 23);
    let question = {
      questionId: questionId,
      lectureId: lectureId,
      userId: userId,
      questionText: questionText
    };
    socket.emit('submitQuestion', question);
    console.log('submitQuestion sent', question);
    console.log('this.props after dispatch in submitQuestion', this.props);
  }

  render () {
    // Capture 'this' context
    let questions = this.props.questions;
    // Assign an id to the main component div so that it can be targeted on toggle events
    return (
      <div id="QuestionBox">
        <input type="text" id="questionInput"></input>
        <button id="submitQuestion" onClick={this.submitQuestion.bind(this)}>Submit</button>
        {Object.keys(questions).sort(function (a, b) {
          if (questions[a].votes < questions[b].votes) return 1;
          return -1;
        }).map(questionId =>
          <Question id={questionId} text={questions[questionId].questionText}/>
        )}
      </div>
    );
  };
};

const mapStateToProps = (state) => {
  return {
    activeLecture: state.activeLecture,
    user: state.user,
    questions: state.questions
  };
};

export default connect(mapStateToProps)(QuestionBox);
