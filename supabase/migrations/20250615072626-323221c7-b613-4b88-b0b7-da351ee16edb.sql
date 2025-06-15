
-- Function to update a user's profile rating whenever a new rating is submitted
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_rating_avg NUMERIC;
  new_total_ratings INT;
BEGIN
  -- Calculate the new average rating and total number of ratings for the user who was rated
  SELECT
    AVG(rating),
    COUNT(rating)
  INTO
    new_rating_avg,
    new_total_ratings
  FROM
    public.ratings
  WHERE
    rated_id = NEW.rated_id;

  -- Update the 'profiles' table with the new rating information
  UPDATE public.profiles
  SET
    rating = new_rating_avg,
    total_ratings = new_total_ratings
  WHERE
    id = NEW.rated_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that executes the function after a new rating is inserted
CREATE TRIGGER on_new_rating
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_rating();
