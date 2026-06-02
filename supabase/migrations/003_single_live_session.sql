-- One live session per event: realtime uses day=1; session title from day_meta.
-- Reset counter so presenter/speech/student stay aligned after testing End Day.

update public.events
set current_day = 1
where id = 'biblical-worldview-2026';

-- If topic was saved on another slot during testing, copy newest non-empty topic to day 1
update public.day_meta d1
set
  topic = coalesce(nullif(trim(src.topic), ''), d1.topic, 'Introduction'),
  date = coalesce(nullif(trim(src.date), ''), d1.date)
from (
  select topic, date
  from public.day_meta
  where event_id = 'biblical-worldview-2026'
    and nullif(trim(topic), '') is not null
  order by day desc
  limit 1
) src
where d1.event_id = 'biblical-worldview-2026' and d1.day = 1;
