import React, { useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { assets } from '../../assets/assets'

function EducatorAddCourses() {
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])

  const [showPopup, setShowPopup] = useState(false)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  const addLectures=()=>{
    setChapters(
      chapters.map((chapter)=>{
        if(chapter.chapterId===setCurrentChapterId){
          const newLecture={
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length >0 ? chapter.chapterContent.splice(-1)[0].lectureOrder +1:1,
            lectureId: uniqid()

          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    )
  }

  // ✅ Initialize Quill once
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write the course description here...',
      })
    }
  }, [])

  // ✅ Handle all chapter actions
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
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.id !== chapterId))
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }

  const handleLecture=(action, chapterId, lectureIndex)=>{
    if(action==='add')
    {
      setCurrentChapterId(chapterId);
      setShowPopup(true);

    }
    else if(action==='remove')
    {
      chapters.map((chapter)=> {
        if(chapter.chapterId===chapterId){
          chapter.chapterContent.splice(lectureIndex, 1);
        }
        return chapter;
      })
    }


  }

  // ✅ Open lecture popup
  const openLecturePopup = (chapterIndex) => {
    setSelectedChapterIndex(chapterIndex)
    setShowPopup(true)
  }

  // ✅ Add lecture to selected chapter
  const addLecture = () => {
    if (selectedChapterIndex === null) return

    const updated = [...chapters]
    updated[selectedChapterIndex].lectures.push({ ...lectureDetails })

    setChapters(updated)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
    setShowPopup(false)
  }

  // ✅ Delete lecture
  const deleteLecture = (chapterIndex, lectureIndex) => {
    const updated = [...chapters]
    updated[chapterIndex].lectures.splice(lectureIndex, 1)
    setChapters(updated)
  }

  // ✅ Delete chapter
  const deleteChapter = (index) => {
    setChapters(chapters.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) =>{
    e.preventDefault()
  }

  return (
    <div className='h-screen overflow-y-auto flex flex-col items-start md:p-8 p-4'>
      <form className='w-full space-y-6' onClick={handleSubmit}>
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
              {image && (
                <img
                  className='max-h-10 rounded'
                  src={URL.createObjectURL(image)}
                  alt='Course thumbnail preview'
                />
              )}
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
              key={chapter.id}
              className='bg-white border rounded-lg mb-4 shadow-sm'
            >
              <div
                className='flex justify-between items-center p-4 border-b cursor-pointer'
                onClick={() => handleChapter('toggle', chapter.id)}
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
                    {chapter.lectures.length} lecture
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
                  {chapter.lectures.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
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
                      <img
                        src={assets.cross_icon}
                        alt='delete lecture'
                        className='cursor-pointer w-4'
                        onClick={() =>
                          deleteLecture(chapterIndex, lectureIndex)
                        }
                      />
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
          className='bg-black text-white w-max py-2.5 px-8 rounded my-4'
        >
          Add Course
        </button>
      </form>

      {/* ---------- LECTURE POPUP ---------- */}
      {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-md'>
            <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>

            {/* Lecture title */}
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

            {/* Duration */}
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

            {/* URL */}
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

            {/* Preview checkbox */}
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
              onClick={addLecture}
              className='w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
            >
              Add Lecture
            </button>

            <img
              onClick={() => setShowPopup(false)}
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

export default EducatorAddCourses
