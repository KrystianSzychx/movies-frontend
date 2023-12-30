import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosConfig';
import { useParams } from 'react-router-dom';
import ReviewForm from '../reviewForm/ReviewForm';
import './Reviews.css'

const Reviews = ({ getMovieData, movie, reviews, setReviews }) => {
  const revText = useRef();
  const [allReviews, setAllReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [editedReviewBody, setEditedReviewBody] = useState("");
  let params = useParams();
  const movieId = params.movieId;

  useEffect(() => {
    getMovieData(movieId);
    api.get(`/api/v1/movies/${movieId}/reviews`)
      .then(response => setAllReviews(response.data))
      .catch(error => console.error('Error fetching reviews', error));
  }, [getMovieData, movieId]);

  const addReview = async (e) => {
    e.preventDefault();

    const rev = revText.current;

    try {
      const response = await api.post("/api/v1/reviews", {
        reviewBody: rev.value,
        imdbId: movieId
      });

      const updatedReviews = reviews != null ?
        [...reviews, { body: rev.value, reviewId: response.data.reviewId }]
        : [{ body: rev.value, reviewId: response.data.reviewId }];

      rev.value = "";

      setReviews(updatedReviews);
      // After adding a review, update the list of all reviews
      api.get(`/api/v1/movies/${movieId}/reviews`)
        .then(response => setAllReviews(response.data))
        .catch(error => console.error('Error fetching reviews:', error));
    } catch (error) {
      console.error("Error adding review:", error);

      if (error.response) {
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        // Inne rodzaje błędów
        console.error("Other error:", error.message);
      }
    }
  };

  const deleteReviewForMovie = async (reviewId) => {
    console.log('Deleting review with ID:', reviewId);
    try {
      await api.delete(`/api/v1/reviews/${reviewId}`);
      // After deleting a review, update the list of all reviews
      api.get(`/api/v1/movies/${movieId}/reviews`)
        .then(response => setAllReviews(response.data))
        .catch(error => console.error('Error fetching reviews:', error));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const openEditForm = (reviewId, body) => {
    setEditingReview(reviewId);
    setEditedReviewBody(body);
  };

  const saveEditedReview = async () => {
    try {
      await api.put(`/api/v1/reviews/${editingReview}`, {
        reviewBody: editedReviewBody,
      });
      // After updating a review, close the edit form and update the list of all reviews
      setEditingReview(null);
      api.get(`/api/v1/movies/${movieId}/reviews`)
        .then(response => setAllReviews(response.data))
        .catch(error => console.error('Error fetching reviews:', error));
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };


  return (
    <Container>
      <Row>
        <Col>
          <h3>Reviews</h3>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <img src={movie?.poster} alt="" />
        </Col>
        <Col>
          <>
            <Row>
              <Col>
                <ReviewForm
                  handleSubmit={addReview}
                  revText={revText}
                  labelText="Write a Review?"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <hr />
              </Col>
            </Row>
          </>
          <h3>All Reviews</h3>
          <hr />
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((r, index) => (
              <React.Fragment key={index}>
                <Row>
                  <Col>{r.body}</Col>
                  <Col className='button-container'>
                    {editingReview === r.reviewId ? (
                      <>
                        <textarea
                          value={editedReviewBody}
                          onChange={(e) => setEditedReviewBody(e.target.value)}
                        />
                        <Button onClick={saveEditedReview}>Save</Button>
                      </>
                    ) : (
                      <Button            
                        onClick={() => openEditForm(r.reviewId, r.body)}
                      >
                        Update
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => deleteReviewForMovie(r.reviewId)}
                    >
                      Delete
                    </Button>
                    </Col>
                </Row>
                <Row>
                  <Col>
                    <hr />
                  </Col>
                </Row>
              </React.Fragment>
            ))
          ) : (
            <Row>
              <Col>No reviews available</Col>
            </Row>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>
    </Container>
  );
};

export default Reviews;
