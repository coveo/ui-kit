export const insertSurveyLink = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const toolbarWidgets = document.getElementById('tsd-widgets');
    if (toolbarWidgets) {
      const feedbackDiv = document.createElement('div');
      feedbackDiv.classList.add('feedback');
      const feedbackLink = document.createElement('a');
      feedbackLink.href =
        'https://docs.google.com/forms/d/e/1FAIpQLSeyNL18g4JWIDR5xEyIMY48JIjyjwXRmlCveecjXBNSLh4Ygg/viewform';
      feedbackLink.target = '_blank';
      feedbackLink.textContent = 'Feedback';
      feedbackDiv.appendChild(feedbackLink);
      toolbarWidgets.appendChild(feedbackDiv);
    }
  });
};
