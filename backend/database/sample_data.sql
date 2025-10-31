USE slotswapper;

INSERT INTO time_slots (user_id, title, description, start_time, end_time) VALUES
(2, 'Morning Standup', 'Daily team standup meeting', '2025-11-03 09:00:00', '2025-11-03 10:00:00'),
(2, 'Project Review', 'Quarterly project review session', '2025-11-03 14:00:00', '2025-11-03 15:30:00'),
(2, 'Client Call', 'Discussion with Mumbai client', '2025-11-04 11:00:00', '2025-11-04 12:00:00'),
(2, 'Training Session', 'React.js workshop for new joiners', '2025-11-05 10:00:00', '2025-11-05 12:00:00');

INSERT INTO time_slots (user_id, title, description, start_time, end_time) VALUES
(3, 'Design Review', 'Mobile app UI/UX design review', '2025-11-03 10:00:00', '2025-11-03 11:30:00'),
(3, 'Development Sprint', 'Feature implementation session', '2025-11-03 13:00:00', '2025-11-03 17:00:00'),
(3, 'Code Review', 'Backend API code review', '2025-11-04 15:00:00', '2025-11-04 16:00:00'),
(3, 'Planning Meeting', 'Sprint planning for Q4', '2025-11-05 09:00:00', '2025-11-05 11:00:00');

INSERT INTO time_slots (user_id, title, description, start_time, end_time) VALUES
(4, 'Database Optimization', 'PostgreSQL performance tuning', '2025-11-03 08:00:00', '2025-11-03 09:00:00'),
(4, 'System Architecture', 'Microservices architecture discussion', '2025-11-03 15:30:00', '2025-11-03 17:00:00'),
(4, 'Bug Fixing', 'Critical production bug fixes', '2025-11-04 13:00:00', '2025-11-04 15:00:00'),
(4, 'Documentation', 'API documentation update', '2025-11-05 14:00:00', '2025-11-05 16:00:00');