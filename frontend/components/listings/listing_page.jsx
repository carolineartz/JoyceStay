import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { fetchListing } from '../../actions/listings'
import { fetchListingReviews } from '../../actions/reviews'
import Loading from '../misc/loading';
import { isInclusivelyAfterDay, DateRangePicker, DayPickerRangeController } from 'react-dates';
import Review from '../reviews/review';
import ReviewForm from '../reviews/review_form';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import Rating from 'react-rating';
import SmallRating from '../misc/small_ratings';

import { AirCon } from '../../static_assets/amenity_icons';

const today = moment();

class Listing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newBooking: {
        startDate:null,
        endDate:null,
        calendarFocused: null,
        openGuestSelect: false,
        numGuests: 1,
        focusedInput: null,
      },
      availCal: {
        startDate:null,
        endDate:null,
        // focusedInput: null,
        // calendarFocused: null,
      }
      
    }
  }

  componentDidMount() {
    const { 
      fetchListing,
      fetchListingReviews, 
    } = this.props;

    document.addEventListener('mousedown', this.handleClickOutsideGuestSelector);
    
    fetchListingReviews(this.props.match.params.id)

    fetchListing(this.props.match.params.id).then(({listing}) => {
      
      //init map
      const mapOptions = {
        center: { lat: listing.lat, lng: listing.lng },
        zoom: 16
      };
      const mapDOMNode = document.getElementById('map')
      this.map = new google.maps.Map(mapDOMNode, mapOptions);
      const blueCircle = new google.maps.Circle({
        strokeColor: 'rgb(161,207,218)',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'rgb(161,207,218)',
        fillOpacity: 0.35,
        map: this.map,
        center: mapOptions.center,
        radius: 150
      });
      blueCircle.setMap(this.map);

      //set availability cal state
      this.setState({
        availCal: {
          ...this.state.availCal,
          startDate: moment(listing.start_date),
          endDate: moment(listing.end_date),
        }
      })

    }); 
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideGuestSelector)
  }

  onFocusChange = (focusedInput) => {
    console.log(focusedInput);
    this.setState({
      newBooking: {
        ...this.state.newBooking,
        // focusedInput: !this.state.focusedInput ? 'startDate' : focusedInput,
        focusedInput
      }
    });
  }

  

  handleClickOutsideGuestSelector = (event) => {
    if (this.GuestSelectorRef && !this.GuestSelectorRef.contains(event.target)) {
      this.setState({ 
        newBooking: {
          ...this.state.newBooking,
          openGuestSelect: false
        }
      }) 
    }
  }

  setGuestSelectorRef = (node) => {
    this.GuestSelectorRef = node;
  }

  handleNumGuestChange(add) {
    let { numGuests } = this.state.newBooking;
    return () => {
      if( numGuests > 0 ) {
        if(add) {
          this.setState({
            newBooking: {
              ...this.state.newBooking,
              numGuests: ++numGuests
            }
          })
        } else if(numGuests > 1) {
          this.setState({
            newBooking: {
              ...this.state.newBooking,
              numGuests: --numGuests
            }
          })  
        }
      }
    }
  }

  handleBooking = () => {
    // console.log('handle booking');
  }

  render() {
    const { 
      listingLoading, 
      amenities, 
      home_types, 
      reviews } = this.props;
    
    if(listingLoading) {
      return <Loading />
    }
    
    const { 
      title, 
      address, 
      price,
      amenity_ids, 
      home_type_id, 
      description,
      id,
      user_id,
      photos,
      rating,
      review_ids,
      ownerPhotoUrl,
      ownerName
    } = this.props.listing;

    let { 
      numGuests,
      openGuestSelect
    } = this.state.newBooking;


    const thumbIdx = 1;
    return (
      <>
      <section className="image-header-container flush-top flex-container">
        { photos.filter((_,idx) => idx === thumbIdx)
            .map((url, idx) => <div className="left-half hero-image grid--50" key={idx} style={{backgroundImage: `url(${url})`}}></div>) }
        <div className="right-half grid--50">
          { photos.filter((_,idx) => idx !== thumbIdx)
            .map((url, idx) => {
                if(idx < 4) {
                  return  (
                  <div className="square-image grid--50" key={idx} style={{backgroundImage: `url(${url})`}}>
                  </div>
                  )
                }
            })
          }
        </div>
      </section>
      <section className="content-container--interior-page flex-container">
        <section className="listing-details-container grid--75">
          {Object.values(home_types).filter(ht => ht.id == home_type_id).map(ht => <h6 key={ht.id} className="text--maroon">{ht.name}</h6>)}
          <h2>{title} {this.props.userId == user_id && 
            <Link to={`/listings/${id}/edit`} >(<span className="text--teal-blue">Edit Listing</span>)</Link>}
          </h2>
          <div className="profile-thumb-wrapper">
            <div className="profile-thumb" style={{backgroundImage: `url(${ownerPhotoUrl})`}}></div>
            <p className="tiny">{ownerName}</p>
          </div>  
          <p>{address}</p>
          <hr className="hr-24"/>
          
          <p>{description}</p>

          
          <hr className="hr-24"/>
          {/* AMENITIES */}

          <div className="amenities">
            <h5>Amenities</h5>
            <ul>
            {Object.values(amenities).filter(a => amenity_ids.includes(a.id)).map(amenity => {
              return <li key={amenity.id}>{amenity.name}</li>
            })}
            </ul>
          </div>

          <hr className="hr-24"/>
          {/* AVAILABILITY */}

          <h5>Availability</h5>
          <DayPickerRangeController
                startDate={this.state.availCal.startDate}
                endDate={this.state.availCal.endDate}
                // readOnly
                isOutsideRange={day => isInclusivelyAfterDay(today, day)}
                onOutsideClick={DayPickerRangeController.onOutsideClick}
                numberOfMonths={2}
                onPrevMonthClick={DayPickerRangeController.onPrevMonthClick}
                onNextMonthClick={DayPickerRangeController.onNextMonthClick}
                onDatesChange={({ startDate, endDate }) => this.setState({ 
                  availCal: {
                    ...this.state.availCal,
                    startDate, 
                    endDate
                 } })}
                focusedInput={null} 
                onFocusChange={focusedInput => this.setState({ focusedInput })}
              />

          <hr className="hr-24"/>
          {/* LOCATION */}
          
          <div className="map-wrapper">
            <h5>Location</h5>
            <div id="map" ref={map => this.mapNode = map}></div>
          </div>

          <hr className="hr-24--no-line"/>
          {/* REVIEWS */}

          <div className="flex-container--no-justify rating-container">
          
            { review_ids.length ? 
              <>
              <h3>{review_ids.length} Review{review_ids.length > 1 ? 's' : ''}</h3> 
              <br />
                <Rating 
                  className="read-only-rating"
                  readonly
                  emptySymbol="fa fa-star-o fa-2x"
                  fullSymbol="fa fa-star fa-2x"
                  initialRating={rating}
                />
              </>
              : 
              <h3>No reviews yet</h3>
            }
          
          </div>

          {/* <hr className="hr-24"/> */}
          {/* LEAVE REVIEWS */}
          {this.props.listing.user_id != this.props.userId ? (
          <>
          <section className="reviews-container">
            {!isEmpty(reviews) ? Object.values(reviews).map(review => <Review key={review.id} review={review} />) : null}
          </section>
          <ReviewForm listing_id={id} />
          </>
          ) :
          null

        }
        </section>
        
        <aside className="floating-booking-container">
          <h3 style={{fontSize: '2.2rem'}}>${price} <span className="tiny bold">per night</span></h3>
          <SmallRating listing={this.props.listing} />
          <hr className="hr-16"/>
          <p className="tiny bold">Dates</p>
          <DateRangePicker
                startDate={this.state.newBooking.startDate}
                startDateId="your_unique_start_date_id" 
                endDate={this.state.newBooking.endDate}
                endDateId="your_unique_end_date_id" 
                startDatePlaceholderText="Check In"
                endDatePlaceholderText="Check Out"
                isOutsideRange={day => isInclusivelyAfterDay(today, day)}
                // onOutsideClick={DayPickerRangeController.onOutsideClick}
                enableOutsideDays={false}
                numberOfMonths={1}
                // onPrevMonthClick={DayPickerRangeController.onPrevMonthClick}
                // onNextMonthClick={DayPickerRangeController.onNextMonthClick}
                onDatesChange={({ startDate, endDate }) => this.setState({
                    newBooking: {
                      ...this.state.newBooking,
                      startDate, 
                      endDate, 
                      start_date: startDate && moment(startDate).format('YYYY-MM-DD HH:mm:00'),
                      end_date: endDate && moment(endDate).format('YYYY-MM-DD HH:mm:00'), 
                    } 
                    
                  })  
                } 
                focusedInput={this.state.newBooking.focusedInput} 
                onFocusChange={this.onFocusChange} 
              />
              <div 
                className="guest-input-wrapper"
                ref={this.setGuestSelectorRef} >
                
                <p className="tiny bold">Guests</p>
                <input 
                  type="text" 
                  className="text-input"
                  placeholder="1 guest" 
                  value={`${numGuests} guest${numGuests > 1 ? 's' : ''}`} 
                  ref={(input) => this.guestSelect = input}
                  readOnly       
                  onFocus={() => this.setState({
                    newBooking: {
                      ...this.state.newBooking,
                      openGuestSelect: !openGuestSelect, 
                      openDatePicker:false
                    }
                  })}
                  />
                {openGuestSelect && 
                <div className='guest-select-container flex-container' >
                  <p>Adults</p>
                  <button className={`button add-subtract sub ${numGuests == 1 ? 'disabled' :''}`} onClick={this.handleNumGuestChange(false)}></button>
                  <span className="guest-count">{numGuests}</span>
                  <button className="button add-subtract add" onClick={this.handleNumGuestChange(true)}></button>
                </div>}
              </div>
              <button className="button--submit" onClick={this.handleBooking}>Book</button>
        </aside>
      </section>
        
      </>
    )
  }
}

const msp = (state, props) => ({
  userId: state.session.id,
  listing: state.entities.listings[props.match.params.id],
  listingLoading: state.ui.listingLoading,
  amenities: state.entities.amenities,
  home_types: state.entities.home_types,
  reviews: state.entities.reviews
})

const mdp = dispatch => ({
  fetchListing: id => dispatch(fetchListing(id)),
  fetchListingReviews: (listingId) => dispatch(fetchListingReviews(listingId))
})

export default withRouter(connect(msp,mdp)(Listing));
