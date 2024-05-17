import SwiftUI
import RealityKit

struct ContentView: View {
    var body: some View {
        ARViewContainer().edgesIgnoringSafeArea(.all)
    }
}

struct ARViewContainer: UIViewRepresentable {
    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        
        // Configure and add AR content here
        let anchor = AnchorEntity(plane: .horizontal)
        let textMesh = MeshResource.generateText("Hello AR!",
                                                 extrusionDepth: 0.1,
                                                 font: .systemFont(ofSize: 1),
                                                 containerFrame: .zero,
                                                 alignment: .center,
                                                 lineBreakMode: .byTruncatingTail)
        let textEntity = ModelEntity(mesh: textMesh)
        anchor.addChild(textEntity)
        arView.scene.addAnchor(anchor)

        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}
}
