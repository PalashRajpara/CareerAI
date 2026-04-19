function SkillGap({ result }) {
    if (!result) {
      return (
        <div className="glass-container">
          <h2>Skill Gap Analysis</h2>
          <p>No data available. Please analyze a resume first.</p>
        </div>
      );
    }
  
    return (
      <div className="glass-container">
        <h2>Skill Gap Analysis Report</h2>
  
        <p style={{ opacity: 0.85, marginTop: "10px" }}>
          Skill Gap Analysis identifies the skills you currently lack
          for different job roles and helps you understand where
          improvement is required.
        </p>
  
        {result.career_recommendations.map((job, index) => (
          <div className="glass-card" key={index}>
            <h3>{job.job_role}</h3>
  
            <p>
              <b>Missing Skills:</b>{" "}
              {job.missing_skills.length > 0
                ? job.missing_skills.join(", ")
                : "No skill gap detected"}
            </p>
  
            <p style={{ opacity: 0.8 }}>
              These skills are essential to increase your readiness
              for this career role and to meet industry standards.
            </p>
          </div>
        ))}
      </div>
    );
  }
  
  export default SkillGap;
  