import './style/style.css';
export default function Error({ message }) {
  return (
    <div>
      <div className="containers" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="cube">
          <div style={{ '--x': '-1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '0', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
        </div>
        <div className="cube">
          <div style={{ '--x': '-1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '0', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
        </div>
        <div className="cube">
          <div style={{ '--x': '-1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '0', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
          <div style={{ '--x': '1', '--y': '0' }}>
            <span style={{ '--i': '3' }}></span>
            <span style={{ '--i': '2' }}></span>
            <span style={{ '--i': '1' }}></span>
          </div>
        </div>
      </div>
      <div>
        <div class="bg-red-100 text-red-800 p-4 rounded-lg" role="alert">
          <strong class="font-bold text-sm mr-4">Error!</strong>
          <span class="block text-sm sm:inline max-sm:mt-2">{message}.</span>
        </div>
      </div>
    </div>
  );
}
