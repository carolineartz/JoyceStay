# == Schema Information
#
# Table name: amenities
#
#  id         :bigint(8)        not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Amenity < ApplicationRecord
  validates :name, presence: true
end
