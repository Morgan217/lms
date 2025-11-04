import React, { useContext, useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

function EducatorEditCourse() {
  const { backendUrl, getToken, userData, enrolledCourses } = useContext(AppContext)
  const { id } = useParams()
  const navigate = useNavigate()

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState(null)

  const [showPopup, setShowPopup] = useState(false)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null)
  const [editingLectureIndex, setEditingLectureIndex] = useState(null)
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  // --- Fetch course data ---
  useEffect(() => {
    let cancelled = false
    const fetchCourse = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(`${backendUrl}/api/course/course-get/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!cancelled && data.success && data.courseData) {
          const c = data.courseData

          const formattedChapters = (c.courseContent || []).map((chapter, chIndex) => ({
            chapterId: chapter.chapterId,
            chapterOrder: chapter.chapterOrder || chIndex + 1,
            chapterTitle: chapter.chapterTitle || '',
            lectures: (chapter.chapterContent || []).map((lec, lecIndex) => ({
              lectureId: lec.lectureId || lec._id || uniqid(),
              lectureTitle: lec.lectureTitle || lec.title || '',
              lectureDuration: lec.lectureDuration || lec.duration || 0,
              lectureUrl: lec.lectureUrl || lec.videoUrl || lec.lectureVideo || '',
              isPreviewFree: lec.isPreviewFree || false,
              lectureOrder: lec.lectureOrder || lecIndex + 1,
            })),
          }))

          setCourseTitle(c.courseTitle || '')
          setCoursePrice(c.coursePrice || 0)
          setDiscount(c.discount || 0)
          setExistingImage(c.courseThumbnail || null)
          setChapters(formattedChapters)
          setCourseData(c)
        } else if (!cancelled) {
          toast.error('Failed to load course details')
        }
      } catch (error) {
        if (!cancelled) toast.error(error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCourse()
    return () => {
      cancelled = true
    }
  }, [id, backendUrl, getToken])

  // --- Initialize Quill only AFTER courseData loads ---
  useEffect(() => {
    if (!courseData || !editorRef.current || quillRef.current) return

    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder: 'Write or edit the course description...',
    })

    quillRef.current.root.innerHTML = courseData.courseDescription || ''
  }, [courseData])

  // --- Handle chapters ---
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:')
      if (title) {
        const newChapter = {
          id: uniqid(),
          chapterTitle: title,
          lectures: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0
              ? chapters[chapters.length - 1].chapterOrder + 1
              : 1,
        }
        setChapters((prev) => [...prev, newChapter])
      }
    } else if (action === 'remove') {
      setChapters((prev) => prev.filter((chapter) => chapter.id !== chapterId))
    } else if (action === 'toggle') {
      setChapters((prev) =>
        prev.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }

  // --- Lecture management ---
  const openLecturePopup = (chapterIndex, lectureIndex = null) => {
    setSelectedChapterIndex(chapterIndex)
    setEditingLectureIndex(lectureIndex)
    if (lectureIndex !== null) {
      setLectureDetails({ ...chapters[chapterIndex].lectures[lectureIndex] })
    } else {
      setLectureDetails({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
      })
    }
    setShowPopup(true)
  }

  const saveLecture = () => {
    if (selectedChapterIndex === null) return
    setChapters((prev) => {
      const updated = [...prev]
      if (editingLectureIndex !== null) {
        updated[selectedChapterIndex].lectures[editingLectureIndex] = {
          ...lectureDetails,
        }
      } else {
        updated[selectedChapterIndex].lectures.push({ ...lectureDetails })
      }
      return updated
    })
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
    setEditingLectureIndex(null)
    setShowPopup(false)
  }

  const deleteLecture = (chapterIndex, lectureIndex) => {
    setChapters((prev) => {
      const updated = [...prev]
      updated[chapterIndex].lectures.splice(lectureIndex, 1)
      return updated
    })
  }

  const deleteChapter = (index) => {
    setChapters((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Submit updated course ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formattedChapters = chapters.map((chapter, index) => ({
        chapterId: chapter.id || uniqid(),
        chapterOrder: index + 1,
        chapterTitle: chapter.chapterTitle,
        chapterContent: (chapter.lectures || []).map((lecture, lecIndex) => ({
          lectureId: lecture.lectureId || uniqid(),
          lectureTitle: lecture.lectureTitle,
          lectureDuration: Number(lecture.lectureDuration) || 0,
          lectureUrl: lecture.lectureUrl,
          isPreviewFree: Boolean(lecture.isPreviewFree),
          lectureOrder: lecIndex + 1,
        })),
      }))

      const CourseData = {
        courseId: id, // <-- add this line
        courseTitle,
        courseDescription:
          quillRef.current && quillRef.current.root
            ? quillRef.current.root.innerHTML
            : '',
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: formattedChapters,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(CourseData))
      if (image) formData.append('image', image)

      for (let pair of formData.entries()) {
  console.log(pair[0] + ': ' + pair[1]);
}

      const token = await getToken()
      const { data } = await axios.put(
        `${backendUrl}/api/course/course-update/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success('Course updated successfully!')

        console.log("Success updated")
      } else {
        toast.error(data.message)
         console.log(data.message)
      }
    } catch (error) {
      toast.error(error.message)
       console.log(error.message)
    }
  }

  if (loading) return <p className='p-6'>Loading course details...</p>

  return (
    <div className='h-screen overflow-y-auto flex flex-col items-start md:p-8 p-4'>
      <form className='w-full space-y-6' onSubmit={handleSubmit}>
        {/* ---------- COURSE TITLE ---------- */}
        <div className='flex flex-col gap-1'>
          <p className='font-medium'>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here...'
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500 w-full'
            required
          />
        </div>

        {/* ---------- DESCRIPTION ---------- */}
        <div className='flex flex-col gap-1'>
          <p className='font-medium'>Course Description</p>
          <div
            ref={editorRef}
            className='border border-gray-400 rounded min-h-[150px]'
          />
        </div>

        {/* ---------- PRICE & THUMBNAIL ---------- */}
        <div className='flex flex-wrap justify-between items-center gap-6'>
          <div className='flex flex-col gap-1'>
            <p className='font-medium'>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              required
            />
          </div>

          <div className='flex items-center gap-3'>
            <p className='font-medium'>Course Thumbnail</p>
            <label
              htmlFor='thumbnailImage'
              className='flex items-center gap-3 cursor-pointer'
            >
              <img
                src={assets.file_upload_icon}
                alt='upload icon'
                className='p-3 bg-blue-500 rounded'
              />
              <input
                type='file'
                id='thumbnailImage'
                onChange={(e) => setImage(e.target.files[0])}
                accept='image/*'
                hidden
              />
              {image ? (
                <img
                  className='max-h-10 rounded'
                  src={URL.createObjectURL(image)}
                  alt='New thumbnail'
                />
              ) : existingImage ? (
                <img
                  className='max-h-10 rounded'
                  src={existingImage}
                  alt='Existing thumbnail'
                />
              ) : null}
            </label>
          </div>
        </div>

        {/* ---------- DISCOUNT ---------- */}
        <div className='flex flex-col gap-1'>
          <p className='font-medium'>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder='0'
            min={0}
            max={100}
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
            required
          />
        </div>

        {/* ---------- CHAPTERS ---------- */}
        <div className='mt-6 w-full'>
          <div className='flex justify-between items-center mb-3'>
            <p className='font-medium text-lg'>Course Chapters</p>
            <button
              type='button'
              onClick={() => handleChapter('add')}
              className='bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition'
            >
              + Add Chapter
            </button>
          </div>

          {chapters.map((chapter, chapterIndex) => (
            <div
              key={chapter.id || chapter.chapterId}
              className='bg-white border rounded-lg mb-4 shadow-sm'
            >
              <div
                className='flex justify-between items-center p-4 border-b cursor-pointer'
                onClick={() => handleChapter('toggle', chapter.id || chapter.chapterId)}
              >
                <div className='flex items-center'>
                  <img
                    src={assets.dropdown_icon}
                    width={14}
                    alt='dropdown icon'
                    className={`mr-2 transition-transform ${
                      chapter.collapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                  <span className='font-semibold'>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-gray-500'>
                    {chapter.lectures?.length || 0} lecture
                  </span>
                  <img
                    src={assets.cross_icon}
                    alt='delete'
                    className='cursor-pointer w-4'
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChapter(chapterIndex)
                    }}
                  />
                </div>
              </div>

              {!chapter.collapsed && (
                <div className='p-4 text-sm text-gray-600'>
                  {chapter.lectures?.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.lectureId || lectureIndex}
                      className='flex justify-between items-center mb-2 border-b pb-1'
                    >
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} –{' '}
                        {lecture.lectureDuration} mins –{' '}
                        <a
                          href={lecture.lectureUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-500'
                        >
                          Link
                        </a>{' '}
                        – {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>

                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() =>
                            openLecturePopup(chapterIndex, lectureIndex)
                          }
                          className='text-sm text-blue-600 underline'
                        >
                          Edit
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            deleteLecture(chapterIndex, lectureIndex)
                          }
                          className='text-sm text-red-600 underline'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  <div
                    onClick={() => openLecturePopup(chapterIndex)}
                    className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 hover:bg-gray-200'
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type='submit'
          className='bg-green-600 text-white w-max py-2.5 px-8 rounded my-4 hover:bg-green-700 transition'
        >
          Update Course
        </button>
      </form>

      {/* ---------- LECTURE POPUP ---------- */}
      {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-md'>
            <h2 className='text-lg font-semibold mb-4'>
              {editingLectureIndex !== null ? 'Edit Lecture' : 'Add Lecture'}
            </h2>

            <div className='mb-2'>
              <p>Lecture Title</p>
              <input
                type='text'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureTitle}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureTitle: e.target.value,
                  })
                }
              />
            </div>

            <div className='mb-2'>
              <p>Duration (minutes)</p>
              <input
                type='number'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureDuration}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureDuration: e.target.value,
                  })
                }
              />
            </div>

            <div className='mb-2'>
              <p>Lecture URL</p>
              <input
                type='text'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureUrl}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className='mb-3 flex items-center gap-2'>
              <input
                type='checkbox'
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
              />
              <p>Is Preview Free?</p>
            </div>

            <button
              type='button'
              onClick={saveLecture}
              className='w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
            >
              {editingLectureIndex !== null ? 'Save Changes' : 'Add Lecture'}
            </button>

            <img
              onClick={() => {
                setShowPopup(false)
                setEditingLectureIndex(null)
              }}
              src={assets.cross_icon}
              className='absolute top-4 right-4 w-4 cursor-pointer'
              alt='close'
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EducatorEditCourse
