Rails.application.routes.draw do
  namespace :api, defaults: {format: :json}  do
    resources :users, only: [:create, :update]
    post '/users/:user_id/listings', to: 'users#index'
    get '/users/:user_id/reviews', to: 'reviews#index'
    get '/users/:user_id/bookings', to: 'bookings#index'
    post '/users/search', to: 'users#user_exists'
    post '/users/fetch', to: 'users#show'
    resource :session, only: [:create, :new, :destroy]

    resources :listings, only: [:create, :destroy, :show, :update, :index]
    
    resources :reviews, only: [:create, :index, :update]
    post '/listings/:listing_id/reviews', to: 'reviews#index'

    resources :bookings, only: [:create, :index, :update, :destroy]
    post '/bookings/ids', to: 'bookings#index'
    get '/listings/:listing_id/bookings', to: 'bookings#index'
    patch '/bookings/:id/:status', to: 'bookings#update_status'
  end

  get '/undefined', to: 'static_pages#root'

  root to: 'static_pages#root'
end
