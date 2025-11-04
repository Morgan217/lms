import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function EducatorMyCourses() {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch educator courses
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Delete course
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/delete-course/${selectedCourse._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Course deleted successfully!");
        setCourses((prev) =>
          prev.filter((course) => course._id !== selectedCourse._id)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting course.");
    } finally {
      setShowModal(false);
      setSelectedCourse(null);
    }
  };

  // ✅ Edit course
  const handleEditCourse = (courseId) => {
    // Navigate to edit page
    navigate(`/educator/edit-course/${courseId}`);
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);

  if (!courses || courses.length === 0) return <Loading />;

  return (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>

        <div className='overflow-x-auto rounded-md border border-gray-200'>
          <table className='w-full table-auto'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
                <th className='px-4 py-3 font-semibold text-center truncate'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => (
                <tr
                  key={course._id}
                  className='border-b border-gray-500/20 hover:bg-gray-50'
                >
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3 truncate'>
                    <img
                      src={course.courseThumbnail}
                      alt='Course Thumbnail'
                      className='w-16 h-10 object-cover rounded'
                    />
                    <span className='truncate hidden md:block'>
                      {course.courseTitle}
                    </span>
                  </td>

                  <td className='px-4 py-3'>
                    {currency}
                    {Math.floor(
                      (course.enrolledStudents?.length || 0) *
                        ((course.coursePrice || 0) -
                          ((course.discount || 0) * (course.coursePrice || 0)) /
                            100)
                    )}
                  </td>

                  <td className='px-4 py-3'>
                    {course.enrolledStudents?.length || 0}
                  </td>

                  <td className='px-4 py-3'>
                    {course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </td>

                  <td className='px-4 py-3 text-center space-x-3'>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditCourse(course._id)}
                      className='text-blue-500 hover:text-blue-700 font-medium'
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowModal(true);
                      }}
                      className='text-red-500 hover:text-red-700 font-medium'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {showModal && selectedCourse && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50'>
          <div className='bg-white p-6 rounded-lg shadow-md w-80'>
            <h3 className='text-lg font-semibold mb-4 text-gray-800'>
              Confirm Delete
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete{' '}
              <strong>{selectedCourse.courseTitle}</strong>? This action cannot
              be undone.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducatorMyCourses;
