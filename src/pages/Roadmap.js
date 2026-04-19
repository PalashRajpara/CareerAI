function Roadmap({ result }) {
    if (!result) {
      return (
        <div className="glass-container">
          <h2>Learning Roadmap</h2>
          <p>Please analyze a resume first.</p>
        </div>
      );
    }
  
    return (
      <div className="glass-container">
        <h2>Personalized Learning Roadmap</h2>
  
        {result.career_recommendations.map((job, i) => (
          <div className="glass-card" key={i}>
            <h3>{job.job_role}</h3>
  
            {job.missing_skills.length === 0 ? (
              <p>No learning required for this role.</p>
            ) : (
              job.missing_skills.map((skill, index) => (
                <p key={index}>📘 Learn: {skill}</p>
              ))
            )}
          </div>
        ))}
      </div>
    );
  }
  
  export default Roadmap;
  