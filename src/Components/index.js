import React from 'react';
import { Modal, FormGroup, Label } from 'reactstrap';

const initialState = {
  MemeText: "",
  textIsDragging: false,
  textColor: '#FFF',
  fontSize: '50px',
  X: "50%",
  Y: "50%"
}

class MainPage extends React.Component {
  constructor() {
    super();
    this.state = {
      wrh: 1,
      modalIsOpen: false,
      currentImagebase64: null,
      imgSrc: [],
      ...initialState
    };
  }

  openImage = (src) => {
    const base_image = new Image();
    base_image.src = src;
    let wrh = base_image.width / base_image.height;
    const base64 = this.getBase64Image(base_image);
    this.setState(prevState => ({
      wrh: wrh,
      modalIsOpen: !prevState.modalIsOpen,
      currentImagebase64: base64,
      ...initialState
    }));
  }

  inputFile = () => {
    let imageFile = this.refs.file.files[0];
    let reader = new FileReader();
    let url = reader.readAsDataURL(imageFile);
    reader.onloadend = () => {
      this.setState({
          imgSrc: [reader.result]
      })
    }
  }

  changeText = (event) => {
    this.setState({
      MemeText: event.currentTarget.value
    });
  }

  changeTextColor = (event) => {
    this.setState({
      textColor: event.currentTarget.value
    });
  }

  changeTextSize = (event) => {
    this.setState({
      fontSize: event.currentTarget.value
    });
  }

  getStateObj = (e, type) => {
    let rect = this.imageRef.getBoundingClientRect();
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    let stateObj = {};
    stateObj = {
      textIsDragging: true,
      isTopDragging: false,
      X: `${xOffset}px`,
      Y: `${yOffset}px`
    }    
    return stateObj;
  }

  handleMouseDown = (e) => {
    const stateObj = this.getStateObj(e);
    document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    this.setState({
      ...stateObj
    })
  }

  handleMouseMove = (e) => {
    if (this.state.isTopDragging || this.state.textIsDragging) {
      let stateObj = {};
      if (this.state.textIsDragging) {
        stateObj = this.getStateObj(e);
      }
      this.setState({
        ...stateObj
      });
    }
  };

  handleMouseUp = (event) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    this.setState({
      textIsDragging: false
    });
  }

  convertSvgToImage = () => {
    const svg = this.svgRef;
    let svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    const img = document.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
    img.onload = function() {
      canvas.getContext("2d").drawImage(img, 0, 0);
      const canvasdata = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = "meme.png";
      a.href = canvasdata;
      document.body.appendChild(a);
      a.click();
    };
  }

  getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  render() {
    let newWidth = 600;
    let newHeight = newWidth / this.state.wrh;
    const textStyle = {
      fontFamily: "Impact",
      fontSize: this.state.fontSize,
      textTransform: "uppercase",
      fill: this.state.textColor,
      // stroke: "#000",
      userSelect: "none"
    }

    return (
      <div>
        <div className="main-content">
          <input type="file" ref="file" accept="image/*" onChange={this.inputFile}/>
          {
            this.state.imgSrc.map(src => 
              <img
                style={{
                  width: "100%",
                  cursor: "pointer",
                  height: "100%"
                }}
                alt="default"
                src={src}
                onClick={() => this.openImage(src)}
              />
            )
          }      
        </div>
        <Modal className="meme-gen-modal" isOpen={this.state.modalIsOpen}>
            <div onClick={() => this.setState(p => ({modalIsOpen: !p.modalIsOpen}))}>CLOSE</div>
            <svg
              width={newWidth}
              height={newHeight}
              ref={el => { this.svgRef = el }}
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <image
                ref={el => { this.imageRef = el }}
                xlinkHref={this.state.currentImagebase64}
                height={newHeight}
                width={newWidth}
              />
              <text
                style={textStyle}
                dominantBaseline="middle"
                textAnchor="middle"
                x={this.state.X}
                y={this.state.Y}
                onMouseDown={event => this.handleMouseDown(event)}
                onMouseUp={event => this.handleMouseUp(event)}
              >
                  {this.state.MemeText}
              </text>
            </svg>
            <div className="meme-form">
              <FormGroup>
                <Label for="MemeText">Adding Text</Label>
                <input className="form-control" type="text" name="MemeText" id="MemeText" placeholder="Add text on Image" onChange={this.changeText} />
                <Label for="MemeColor">Change text color</Label>
                <input className="form-control" type="text" name="MemeColor" id="MemeColor" placeholder="Change text color" onChange={this.changeTextColor} value={this.state.textColor}/>
                <Label for="MemeSize">Change text size</Label>
                <input className="form-control" type="text" name="MemeSize" id="MemeSize" placeholder="Change text size" onChange={this.changeTextSize} value={this.state.fontSize}/>
              </FormGroup>
              <button onClick={() => this.convertSvgToImage()} className="btn btn-primary">Download Meme!</button>
            </div>
        </Modal>
      </div>
    )
  }
}

export default MainPage;
