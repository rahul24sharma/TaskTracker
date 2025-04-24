import React from 'react'

const JobsLayout = ({result}) => {
  return (
    <>
    <div>
    <h3 className="text-lg font-bold mb-3">{result.length} Jobs</h3>
    </div>
    <section className='card-container'>
    {result}
    </section>
    </>
  )
}

export default JobsLayout
