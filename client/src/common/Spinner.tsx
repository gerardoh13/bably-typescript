
function Spinner() {
  return (
    <div className="card my-auto text-center">
      <div className="card-body">
        <h1 className="card-title">Loading</h1>

        <div className="spinner-grow text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="spinner-grow text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
}
export default Spinner;
